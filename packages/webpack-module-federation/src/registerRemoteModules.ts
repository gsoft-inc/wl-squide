import { isFunction, isNil, registerModule, type AbstractRuntime, type DeferredRegisterationFunction, type Logger, type ModuleRegistrationStatus } from "@squide/core";
import { loadRemote as loadModuleFederationRemote, type LoadRemoteFunction } from "./loadRemote.ts";
import { RemoteEntryPoint, RemoteModuleName, type RemoteDefinition } from "./remoteDefinition.ts";

interface DeferredRegistration<TData = unknown> {
    url: string;
    containerName: string;
    index: string;
    fct: DeferredRegisterationFunction<TData>;
}

export interface RegisterRemoteModulesOptions<TContext> {
    context?: TContext;
}

export interface RemoteModuleRegistrationError {
    // The remote base URL.
    url: string;
    // The remote container name.
    containerName: string;
    // The remote resource module name.
    moduleName: string;
    // The registration error.
    error: unknown;
}

export class RemoteModuleRegistry {
    #registrationStatus: ModuleRegistrationStatus = "none";

    readonly #deferredRegistrations: DeferredRegistration[] = [];
    readonly #loadRemote: LoadRemoteFunction;

    constructor(loadRemote: LoadRemoteFunction) {
        this.#loadRemote = loadRemote;
    }

    #logSharedScope(logger: Logger) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (__webpack_share_scopes__) {
            logger.debug(
                "[squide] [remote] Module Federation shared scope is available:",
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                __webpack_share_scopes__.default
            );
        }
    }

    async registerModules<TRuntime extends AbstractRuntime = AbstractRuntime, TContext = unknown, TData = unknown>(remotes: RemoteDefinition[], runtime: TRuntime, { context }: RegisterRemoteModulesOptions<TContext> = {}) {
        const errors: RemoteModuleRegistrationError[] = [];

        if (this.#registrationStatus !== "none") {
            throw new Error("[squide] [remote] The registerRemoteModules function can only be called once.");
        }

        runtime.logger.debug(`[squide] [remote] Found ${remotes.length} remote module${remotes.length !== 1 ? "s" : ""} to register.`);

        this.#registrationStatus = "in-progress";

        await Promise.allSettled(remotes.map(async (x, index) => {
            let remoteUrl;

            const containerName = x.name;

            try {
                // Is included in the try/catch becase the URL could be invalid and cause an error.
                remoteUrl = new URL(RemoteEntryPoint, x.url).toString();

                runtime.logger.debug(`[squide] [remote] ${index + 1}/${remotes.length} Loading module "${RemoteModuleName}" from container "${containerName}" of remote "${remoteUrl}".`);

                const module = await this.#loadRemote(remoteUrl, containerName, RemoteModuleName);

                if (isNil(module.register)) {
                    throw new Error(`[squide] [remote] A "register" function is not available for module "${RemoteModuleName}" of container "${containerName}" from remote "${remoteUrl}". Make sure your remote "./register.js" file export a function named "register".`);
                }

                runtime.logger.debug(`[squide] [remote] ${index + 1}/${remotes.length} Registering module "${RemoteModuleName}" from container "${containerName}" of remote "${remoteUrl}".`);

                const optionalDeferedRegistration = await registerModule<TRuntime, TContext, TData>(module.register, runtime, context);

                if (isFunction(optionalDeferedRegistration)) {
                    this.#deferredRegistrations.push({
                        url: remoteUrl,
                        containerName: x.name,
                        index: `${index + 1}/${remotes.length}`,
                        fct: optionalDeferedRegistration as DeferredRegisterationFunction<unknown>
                    });
                }

                runtime.logger.debug(`[squide] [remote] ${index + 1}/${remotes.length} Container "${containerName}" of remote "${remoteUrl}" registration completed.`);
            } catch (error: unknown) {
                runtime.logger.error(
                    `[squide] [remote] ${index + 1}/${remotes.length} An error occured while registering module "${RemoteModuleName}" from container "${containerName}" of remote "${remoteUrl}".`,
                    error
                );

                errors.push({
                    url: remoteUrl ?? `Partial URL is: "${x.url}"`,
                    containerName,
                    moduleName: RemoteModuleName,
                    error
                });
            }
        }));

        this.#registrationStatus = this.#deferredRegistrations.length > 0 ? "registered" : "ready";

        if (this.#registrationStatus === "ready") {
            this.#logSharedScope(runtime.logger);
        }

        return errors;
    }

    async completeModuleRegistrations<TRuntime extends AbstractRuntime = AbstractRuntime, TData = unknown>(runtime: TRuntime, data?: TData) {
        const errors: RemoteModuleRegistrationError[] = [];

        if (this.#registrationStatus === "none" || this.#registrationStatus === "in-progress") {
            throw new Error("[squide] [remote] The completeRemoteModuleRegistration function can only be called once the registerRemoteModules function terminated.");
        }

        if (this.#registrationStatus !== "registered" && this.#deferredRegistrations.length > 0) {
            throw new Error("[squide] [remote] The completeRemoteModuleRegistration function can only be called once.");
        }

        if (this.#registrationStatus === "ready") {
            // No defered registrations were returned by the remote modules, skip the completion process.
            return Promise.resolve(errors);
        }

        this.#registrationStatus = "in-completion";

        await Promise.allSettled(this.#deferredRegistrations.map(async ({ url, containerName, index, fct: deferredRegister }) => {
            runtime.logger.debug(`[squide] [remote] ${index} Completing registration for module "${RemoteModuleName}" from container "${containerName}" of remote "${url}".`);

            try {
                await deferredRegister(data);
            } catch (error: unknown) {
                runtime.logger.error(
                    `[squide] [remote] ${index} An error occured while completing the registration for module "${RemoteModuleName}" from container "${containerName}" of remote "${url}".`,
                    error
                );

                errors.push({
                    url,
                    containerName,
                    moduleName: RemoteModuleName,
                    error
                });
            }

            runtime.logger.debug(`[squide] [remote] ${index} Completed registration for module "${RemoteModuleName}" from container "${containerName}" of remote "${url}".`);
        }));

        this.#registrationStatus = "ready";

        this.#logSharedScope(runtime.logger);

        return errors;
    }

    get registrationStatus() {
        return this.#registrationStatus;
    }

    // Required to test hooks that dependent on the registration status.
    resetRegistrationStatus() {
        this.#registrationStatus = "none";
    }
}

const remoteModuleRegistry = new RemoteModuleRegistry(loadModuleFederationRemote);

export function registerRemoteModules<TRuntime extends AbstractRuntime = AbstractRuntime, TContext = unknown, TData = unknown>(remotes: RemoteDefinition[], runtime: TRuntime, options?: RegisterRemoteModulesOptions<TContext>) {
    return remoteModuleRegistry.registerModules<TRuntime, TContext, TData>(remotes, runtime, options);
}

export function completeRemoteModuleRegistrations<TRuntime extends AbstractRuntime = AbstractRuntime, TData = unknown>(runtime: TRuntime, data?: TData) {
    return remoteModuleRegistry.completeModuleRegistrations(runtime, data);
}

export function getRemoteModuleRegistrationStatus() {
    return remoteModuleRegistry.registrationStatus;
}

// Required to test hooks that dependent on the registration status.
export function resetRemoteModuleRegistrationStatus() {

}
