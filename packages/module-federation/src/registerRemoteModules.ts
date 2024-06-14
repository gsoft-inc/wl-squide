import { loadRemote as loadModuleFederationRemote } from "@module-federation/enhanced/runtime";
import { isFunction, isNil, registerModule, type DeferredRegistrationFunction, type Logger, type ModuleRegistrationStatus, type Runtime } from "@squide/core";
import type { RemoteDefinition } from "./remoteDefinition.ts";

const RemoteRegisterModuleName = "register";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type LoadRemoteFunction = (remoteName: string, moduleName: string) => Promise<any>;

interface DeferredRegistration<TData = unknown> {
    remoteName: string;
    index: string;
    fct: DeferredRegistrationFunction<TData>;
}

export interface RegisterRemoteModulesOptions<TContext> {
    context?: TContext;
}

export type RemoteModuleRegistrationStatusChangedListener = () => void;

export interface RemoteModuleRegistrationError {
    // The name of the remote module.
    remoteName: string;
    // The name of the remote module resource.
    moduleName: string;
    // The registration error.
    error: unknown;
}

export class RemoteModuleRegistry {
    #registrationStatus: ModuleRegistrationStatus = "none";

    readonly #deferredRegistrations: DeferredRegistration[] = [];
    readonly #loadRemote: LoadRemoteFunction;
    readonly #statusChangedListeners = new Set<RemoteModuleRegistrationStatusChangedListener>();

    constructor(loadRemote: LoadRemoteFunction) {
        this.#loadRemote = loadRemote;
    }

    #logSharedScope(logger: Logger) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (__webpack_share_scopes__) {
            logger.debug(
                "[squide] Module Federation shared scope is available:",
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                __webpack_share_scopes__.default
            );
        }
    }

    async registerModules<TRuntime extends Runtime = Runtime, TContext = unknown, TData = unknown>(remotes: RemoteDefinition[], runtime: TRuntime, { context }: RegisterRemoteModulesOptions<TContext> = {}) {
        const errors: RemoteModuleRegistrationError[] = [];

        if (this.#registrationStatus !== "none") {
            throw new Error("[squide] The registerRemoteModules function can only be called once.");
        }

        runtime.logger.debug(`[squide] Found ${remotes.length} remote module${remotes.length !== 1 ? "s" : ""} to register.`);

        this.#setRegistrationStatus("registering-modules");

        await Promise.allSettled(remotes.map(async (x, index) => {
            const remoteName = x.name;

            try {
                runtime.logger.debug(`[squide] ${index + 1}/${remotes.length} Loading module "${RemoteRegisterModuleName}" of remote "${remoteName}".`);

                const module = await this.#loadRemote(remoteName, RemoteRegisterModuleName);

                if (isNil(module.register)) {
                    throw new Error(`[squide] A "register" function is not available for module "${RemoteRegisterModuleName}" of remote "${remoteName}". Make sure your remote "./register.[js,jsx,ts.tsx]" file export a function named "register".`);
                }

                runtime.logger.debug(`[squide] ${index + 1}/${remotes.length} Registering module "${RemoteRegisterModuleName}" of remote "${remoteName}".`);

                const optionalDeferredRegistration = await registerModule<TRuntime, TContext, TData>(module.register, runtime, context);

                if (isFunction(optionalDeferredRegistration)) {
                    this.#deferredRegistrations.push({
                        remoteName: x.name,
                        index: `${index + 1}/${remotes.length}`,
                        fct: optionalDeferredRegistration as DeferredRegistrationFunction<unknown>
                    });
                }

                runtime.logger.debug(`[squide] ${index + 1}/${remotes.length} The registration of the remote "${remoteName}" is completed.`);
            } catch (error: unknown) {
                runtime.logger.error(
                    `[squide] ${index + 1}/${remotes.length} An error occured while registering module "${RemoteRegisterModuleName}" of remote "${remoteName}".`,
                    error
                );

                errors.push({
                    remoteName,
                    moduleName: RemoteRegisterModuleName,
                    error
                });
            }
        }));

        this.#setRegistrationStatus(this.#deferredRegistrations.length > 0 ? "modules-registered" : "ready");

        // After introducting the "setRegistrationStatus" method, TypeScript seems to think that the only possible
        // values for registrationStatus is "none" and now complains about the lack of overlapping between "none" and "ready".
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (this.#registrationStatus === "ready") {
            this.#logSharedScope(runtime.logger);
        }

        return errors;
    }

    async registerDeferredRegistrations<TRuntime extends Runtime = Runtime, TData = unknown>(runtime: TRuntime, data: TData) {
        const errors: RemoteModuleRegistrationError[] = [];

        if (this.#registrationStatus === "none" || this.#registrationStatus === "registering-modules") {
            throw new Error("[squide] The registerDeferredRegistrations function can only be called once the registerRemoteModules function terminated.");
        }

        if (this.#registrationStatus !== "modules-registered" && this.#deferredRegistrations.length > 0) {
            throw new Error("[squide] The registerDeferredRegistrations function can only be called once.");
        }

        if (this.#registrationStatus === "ready") {
            // No deferred registrations were returned by the remote modules, skip the completion process.
            return errors;
        }

        this.#setRegistrationStatus("registering-deferred-registration");

        await Promise.allSettled(this.#deferredRegistrations.map(async ({ remoteName, index, fct: deferredRegister }) => {
            runtime.logger.debug(`[squide] ${index} Registering the deferred registrations for module "${RemoteRegisterModuleName}" of remote "${remoteName}".`);

            try {
                await deferredRegister(data, "register");
            } catch (error: unknown) {
                runtime.logger.error(
                    `[squide] ${index} An error occured while registering the deferred registrations for module "${RemoteRegisterModuleName}" of remote "${remoteName}".`,
                    error
                );

                errors.push({
                    remoteName,
                    moduleName: RemoteRegisterModuleName,
                    error
                });
            }

            runtime.logger.debug(`[squide] ${index} Registered the deferred registrations for module "${RemoteRegisterModuleName}" of remote "${remoteName}".`);
        }));

        this.#setRegistrationStatus("ready");

        this.#logSharedScope(runtime.logger);

        return errors;
    }

    async updateDeferredRegistrations<TRuntime extends Runtime = Runtime, TData = unknown>(runtime: TRuntime, data: TData) {
        const errors: RemoteModuleRegistrationError[] = [];

        if (this.#registrationStatus !== "ready") {
            throw new Error("[squide] The updateDeferredRegistrations function can only be called once the remote modules are ready.");
        }

        await Promise.allSettled(this.#deferredRegistrations.map(async ({ remoteName, index, fct: deferredRegister }) => {
            runtime.logger.debug(`[squide] ${index} Updating the deferred registrations for module "${RemoteRegisterModuleName}" of remote "${remoteName}".`);

            try {
                await deferredRegister(data, "update");
            } catch (error: unknown) {
                runtime.logger.error(
                    `[squide] ${index} An error occured while updating the deferred registrations for module "${RemoteRegisterModuleName}" of remote "${remoteName}".`,
                    error
                );

                errors.push({
                    remoteName,
                    moduleName: RemoteRegisterModuleName,
                    error
                });
            }

            runtime.logger.debug(`[squide] ${index} Updated the deferred registrations for module "${RemoteRegisterModuleName}" of remote "${remoteName}".`);
        }));

        return errors;
    }

    registerStatusChangedListener(callback: RemoteModuleRegistrationStatusChangedListener) {
        this.#statusChangedListeners.add(callback);
    }

    removeStatusChangedListener(callback: RemoteModuleRegistrationStatusChangedListener) {
        this.#statusChangedListeners.delete(callback);
    }

    #setRegistrationStatus(status: ModuleRegistrationStatus) {
        this.#registrationStatus = status;

        this.#statusChangedListeners.forEach(x => {
            x();
        });
    }

    get registrationStatus() {
        return this.#registrationStatus;
    }

    // Required to test hooks that dependent on the registration status.
    resetRegistrationStatus() {
        this.#registrationStatus = "none";
    }
}

const remoteModuleRegistry = new RemoteModuleRegistry((remoteName, moduleName) => loadModuleFederationRemote(`${remoteName}/${moduleName}`));

export function registerRemoteModules<TRuntime extends Runtime = Runtime, TContext = unknown, TData = unknown>(remotes: RemoteDefinition[], runtime: TRuntime, options?: RegisterRemoteModulesOptions<TContext>) {
    return remoteModuleRegistry.registerModules<TRuntime, TContext, TData>(remotes, runtime, options);
}

export function registerRemoteModuleDeferredRegistrations<TRuntime extends Runtime = Runtime, TData = unknown>(runtime: TRuntime, data: TData) {
    return remoteModuleRegistry.registerDeferredRegistrations(runtime, data);
}

export function updateRemoteModuleDeferredRegistrations<TRuntime extends Runtime = Runtime, TData = unknown>(runtime: TRuntime, data: TData) {
    return remoteModuleRegistry.updateDeferredRegistrations(runtime, data);
}

export function getRemoteModuleRegistrationStatus() {
    return remoteModuleRegistry.registrationStatus;
}

export function addRemoteModuleRegistrationStatusChangedListener(callback: RemoteModuleRegistrationStatusChangedListener) {
    remoteModuleRegistry.registerStatusChangedListener(callback);
}

export function removeRemoteModuleRegistrationStatusChangedListener(callback: RemoteModuleRegistrationStatusChangedListener) {
    remoteModuleRegistry.removeStatusChangedListener(callback);
}
