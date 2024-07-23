import type { Runtime } from "../runtime/runtime.ts";
import { isFunction } from "../shared/assertions.ts";
import type { ModuleRegistrationStatus } from "./moduleRegistrationStatus.ts";
import { registerModule, type DeferredRegistrationFunction, type ModuleRegisterFunction } from "./registerModule.ts";

interface DeferredRegistration<TData = unknown> {
    index: string;
    fct: DeferredRegistrationFunction<TData>;
}

export interface RegisterLocalModulesOptions<TContext> {
    context?: TContext;
}

export type LocalModuleRegistrationStatusChangedListener = () => void;

export interface LocalModuleRegistrationError {
    // The registration error.
    error: unknown;
}

export class LocalModuleRegistry {
    #registrationStatus: ModuleRegistrationStatus = "none";
    readonly #deferredRegistrations: DeferredRegistration[] = [];
    readonly #statusChangedListeners = new Set<LocalModuleRegistrationStatusChangedListener>();

    async registerModules<TRuntime extends Runtime = Runtime, TContext = unknown, TData = unknown>(registerFunctions: ModuleRegisterFunction<TRuntime, TContext, TData>[], runtime: TRuntime, { context }: RegisterLocalModulesOptions<TContext> = {}) {
        const errors: LocalModuleRegistrationError[] = [];

        if (this.#registrationStatus !== "none") {
            throw new Error("[squide] The registerLocalModules function can only be called once.");
        }

        runtime.logger.debug(`[squide] Found ${registerFunctions.length} local module${registerFunctions.length !== 1 ? "s" : ""} to register.`);

        this.#setRegistrationStatus("registering-modules");

        await Promise.allSettled(registerFunctions.map(async (x, index) => {
            runtime.logger.debug(`[squide] ${index + 1}/${registerFunctions.length} Registering local module.`);

            try {
                const optionalDeferredRegistration = await registerModule(x as ModuleRegisterFunction<Runtime, TContext, TData>, runtime, context);

                if (isFunction(optionalDeferredRegistration)) {
                    this.#deferredRegistrations.push({
                        index: `${index + 1}/${registerFunctions.length}`,
                        fct: optionalDeferredRegistration as DeferredRegistrationFunction
                    });
                }
            } catch (error: unknown) {
                runtime.logger.error(
                    `[squide] ${index + 1}/${registerFunctions.length} An error occured while registering a local module.`,
                    error
                );

                errors.push({
                    error
                });
            }

            runtime.logger.debug(`[squide] ${index + 1}/${registerFunctions.length} Local module registration completed.`);
        }));

        this.#setRegistrationStatus(this.#deferredRegistrations.length > 0 ? "modules-registered" : "ready");

        return errors;
    }

    async registerDeferredRegistrations<TRuntime extends Runtime = Runtime, TData = unknown>(runtime: TRuntime, data: TData) {
        const errors: LocalModuleRegistrationError[] = [];

        if (this.#registrationStatus === "none" || this.#registrationStatus === "registering-modules") {
            throw new Error("[squide] The registerDeferredRegistrations function can only be called once the local modules are registered.");
        }

        if (this.#registrationStatus !== "modules-registered" && this.#deferredRegistrations.length > 0) {
            throw new Error("[squide] The registerDeferredRegistrations function can only be called once.");
        }

        if (this.#registrationStatus === "ready") {
            // No deferred registrations were returned by the local modules, skip the completion process.
            return errors;
        }

        this.#setRegistrationStatus("registering-deferred-registration");

        await Promise.allSettled(this.#deferredRegistrations.map(async ({ index, fct: deferredRegister }) => {
            runtime.logger.debug(`[squide] ${index} Registering local module deferred registration.`, "Data:", data);

            try {
                await deferredRegister(data, "register");
            } catch (error: unknown) {
                runtime.logger.error(
                    `[squide] ${index} An error occured while registering the deferred registrations of a local module.`,
                    error
                );

                errors.push({
                    error
                });
            }

            runtime.logger.debug(`[squide] ${index} Registered local module deferred registration.`);
        }));

        this.#setRegistrationStatus("ready");

        return errors;
    }

    async updateDeferredRegistrations<TRuntime extends Runtime = Runtime, TData = unknown>(runtime: TRuntime, data: TData) {
        const errors: LocalModuleRegistrationError[] = [];

        if (this.#registrationStatus !== "ready") {
            throw new Error("[squide] The updateDeferredRegistrations function can only be called once the local modules are ready.");
        }

        await Promise.allSettled(this.#deferredRegistrations.map(async ({ index, fct: deferredRegister }) => {
            runtime.logger.debug(`[squide] ${index} Updating local module deferred registration.`, "Data:", data);

            try {
                await deferredRegister(data, "update");
            } catch (error: unknown) {
                runtime.logger.error(
                    `[squide] ${index} An error occured while updating the deferred registrations of a local module.`,
                    error
                );

                errors.push({
                    error
                });
            }

            runtime.logger.debug(`[squide] ${index} Updated local module deferred registration.`);
        }));

        return errors;
    }

    registerStatusChangedListener(callback: LocalModuleRegistrationStatusChangedListener) {
        this.#statusChangedListeners.add(callback);
    }

    removeStatusChangedListener(callback: LocalModuleRegistrationStatusChangedListener) {
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
}

const localModuleRegistry = new LocalModuleRegistry();

export function registerLocalModules<TRuntime extends Runtime = Runtime, TContext = unknown, TData = unknown>(registerFunctions: ModuleRegisterFunction<TRuntime, TContext, TData>[], runtime: TRuntime, options?: RegisterLocalModulesOptions<TContext>) {
    return localModuleRegistry.registerModules(registerFunctions, runtime, options);
}

export function registerLocalModuleDeferredRegistrations<TRuntime extends Runtime = Runtime, TData = unknown>(runtime: TRuntime, data: TData) {
    return localModuleRegistry.registerDeferredRegistrations(runtime, data);
}

export function updateLocalModuleDeferredRegistrations<TRuntime extends Runtime = Runtime, TData = unknown>(runtime: TRuntime, data: TData) {
    return localModuleRegistry.updateDeferredRegistrations(runtime, data);
}

export function getLocalModuleRegistrationStatus() {
    return localModuleRegistry.registrationStatus;
}

export function addLocalModuleRegistrationStatusChangedListener(callback: LocalModuleRegistrationStatusChangedListener) {
    localModuleRegistry.registerStatusChangedListener(callback);
}

export function removeLocalModuleRegistrationStatusChangedListener(callback: LocalModuleRegistrationStatusChangedListener) {
    localModuleRegistry.removeStatusChangedListener(callback);
}
