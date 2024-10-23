import type { Runtime } from "../runtime/runtime.ts";
import { isFunction } from "../shared/assertions.ts";
import type { ModuleRegistrationError, ModuleRegistrationStatus, ModuleRegistrationStatusChangedListener, ModuleRegistry, RegisterModulesOptions } from "./moduleRegistry.ts";
import { registerModule, type DeferredRegistrationFunction, type ModuleRegisterFunction } from "./registerModule.ts";

export const LocalModuleRegistrationStartedEvent = "squide-local-module-registration-started";
export const LocalModuleRegistrationCompletedEvent = "squide-local-module-registration-completed";
export const LocalModuleRegistrationFailedEvent = "squide-local-module-registration-failed";

export const LocalModuleDeferredRegistrationStartedEvent = "squide-local-module-deferred-registration-started";
export const LocalModuleDeferredRegistrationCompletedEvent = "squide-local-module-deferred-registration-completed";
export const LocalModuleDeferredRegistrationFailedEvent = "squide-local-module-deferred-registration-failed";

export interface LocalModuleRegistrationStartedEventPayload {
    moduleCount: number;
}

export interface LocalModuleDeferredRegistrationStartedEventPayload {
    registrationCount: number;
}

interface DeferredRegistration<TData = unknown> {
    index: string;
    fct: DeferredRegistrationFunction<TData>;
}

export class LocalModuleRegistry implements ModuleRegistry {
    #registrationStatus: ModuleRegistrationStatus = "none";

    readonly #deferredRegistrations: DeferredRegistration[] = [];
    readonly #statusChangedListeners = new Set<ModuleRegistrationStatusChangedListener>();

    async registerModules<TRuntime extends Runtime = Runtime<unknown, unknown>, TContext = unknown, TData = unknown>(registrationFunctions: ModuleRegisterFunction<TRuntime, TContext, TData>[], runtime: TRuntime, { context }: RegisterModulesOptions<TContext> = {}) {
        const errors: ModuleRegistrationError[] = [];

        if (this.#registrationStatus !== "none") {
            throw new Error("[squide] The registerLocalModules function can only be called once.");
        }

        runtime.logger.debug(`[squide] Found ${registrationFunctions.length} local module${registrationFunctions.length !== 1 ? "s" : ""} to register.`);

        this.#setRegistrationStatus("registering-modules");

        runtime.eventBus.dispatch(LocalModuleRegistrationStartedEvent, { moduleCount: registrationFunctions.length } satisfies LocalModuleRegistrationStartedEventPayload);

        await Promise.allSettled(registrationFunctions.map(async (x, index) => {
            runtime.logger.debug(`[squide] ${index + 1}/${registrationFunctions.length} Registering local module.`);

            try {
                const optionalDeferredRegistration = await registerModule(x as ModuleRegisterFunction<Runtime, TContext, TData>, runtime, context);

                if (isFunction(optionalDeferredRegistration)) {
                    this.#deferredRegistrations.push({
                        index: `${index + 1}/${registrationFunctions.length}`,
                        fct: optionalDeferredRegistration as DeferredRegistrationFunction
                    });
                }
            } catch (error: unknown) {
                runtime.logger.error(
                    `[squide] ${index + 1}/${registrationFunctions.length} An error occured while registering a local module.`,
                    error
                );

                errors.push({
                    error: error as Error
                });
            }

            runtime.logger.debug(`[squide] ${index + 1}/${registrationFunctions.length} Local module registration completed.`);
        }));

        if (errors.length > 0) {
            errors.forEach(x => {
                runtime.eventBus.dispatch(LocalModuleRegistrationFailedEvent, x);
            });
        }

        // Must be dispatched before changing the registration status to ensure bootstrapping events sequencing.
        runtime.eventBus.dispatch(LocalModuleRegistrationCompletedEvent);

        this.#setRegistrationStatus(this.#deferredRegistrations.length > 0 ? "modules-registered" : "ready");

        return errors;
    }

    async registerDeferredRegistrations<TData = unknown, TRuntime extends Runtime = Runtime>(data: TData, runtime: TRuntime) {
        const errors: ModuleRegistrationError[] = [];

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

        runtime.eventBus.dispatch(LocalModuleDeferredRegistrationStartedEvent, { registrationCount: this.#deferredRegistrations.length } satisfies LocalModuleDeferredRegistrationStartedEventPayload);

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
                    error: error as Error
                });
            }

            runtime.logger.debug(`[squide] ${index} Registered local module deferred registration.`);
        }));

        if (errors.length > 0) {
            errors.forEach(x => {
                runtime.eventBus.dispatch(LocalModuleDeferredRegistrationFailedEvent, x);
            });
        }

        // Must be dispatched before changing the registration status to ensure bootstrapping events sequencing.
        runtime.eventBus.dispatch(LocalModuleDeferredRegistrationCompletedEvent);

        this.#setRegistrationStatus("ready");

        return errors;
    }

    async updateDeferredRegistrations<TData = unknown, TRuntime extends Runtime = Runtime>(data: TData, runtime: TRuntime) {
        const errors: ModuleRegistrationError[] = [];

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
                    error: error as Error
                });
            }

            runtime.logger.debug(`[squide] ${index} Updated local module deferred registration.`);
        }));

        return errors;
    }

    registerStatusChangedListener(callback: ModuleRegistrationStatusChangedListener) {
        this.#statusChangedListeners.add(callback);
    }

    removeStatusChangedListener(callback: ModuleRegistrationStatusChangedListener) {
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

let localModuleRegistry: ModuleRegistry | undefined;

function getLocalModuleRegistry() {
    if (!localModuleRegistry) {
        localModuleRegistry = new LocalModuleRegistry();
    }

    return localModuleRegistry;
}

// This function should only be used by tests.
export function __setLocalModuleRegistry(registry: ModuleRegistry) {
    localModuleRegistry = registry;
}

// This function should only be used by tests.
export function __clearLocalModuleRegistry() {
    localModuleRegistry = undefined;
}

export function registerLocalModules<TRuntime extends Runtime = Runtime, TContext = unknown, TData = unknown>(modules: ModuleRegisterFunction<TRuntime, TContext, TData>[], runtime: TRuntime, options?: RegisterModulesOptions<TContext>) {
    return getLocalModuleRegistry().registerModules(modules, runtime, options);
}

export function registerLocalModuleDeferredRegistrations<TData = unknown, TRuntime extends Runtime = Runtime>(data: TData, runtime: TRuntime) {
    return getLocalModuleRegistry().registerDeferredRegistrations(data, runtime);
}

export function updateLocalModuleDeferredRegistrations<TData = unknown, TRuntime extends Runtime = Runtime>(data: TData, runtime: TRuntime) {
    return getLocalModuleRegistry().updateDeferredRegistrations(data, runtime);
}

export function getLocalModuleRegistrationStatus() {
    return getLocalModuleRegistry().registrationStatus;
}

export function addLocalModuleRegistrationStatusChangedListener(callback: ModuleRegistrationStatusChangedListener) {
    getLocalModuleRegistry().registerStatusChangedListener(callback);
}

export function removeLocalModuleRegistrationStatusChangedListener(callback: ModuleRegistrationStatusChangedListener) {
    getLocalModuleRegistry().removeStatusChangedListener(callback);
}
