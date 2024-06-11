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
    #deferredRegistrations: DeferredRegistration[] = [];

    readonly #statusChangedListeners = new Set<LocalModuleRegistrationStatusChangedListener>();

    async registerModules<TRuntime extends Runtime = Runtime, TContext = unknown, TData = unknown>(registerFunctions: ModuleRegisterFunction<TRuntime, TContext, TData>[], runtime: TRuntime, { context }: RegisterLocalModulesOptions<TContext> = {}) {
        const errors: LocalModuleRegistrationError[] = [];

        if (this.#registrationStatus !== "none") {
            throw new Error("[squide] The registerLocalModules function can only be called once.");
        }

        runtime.logger.debug(`[squide] Found ${registerFunctions.length} local module${registerFunctions.length !== 1 ? "s" : ""} to register.`);

        this.#setRegistrationStatus("in-progress");

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

        this.#setRegistrationStatus(this.#deferredRegistrations.length > 0 ? "registered" : "ready");

        return errors;
    }

    async completeModuleRegistrations<TRuntime extends Runtime = Runtime, TData = unknown>(runtime: TRuntime, data?: TData) {
        const errors: LocalModuleRegistrationError[] = [];

        if (this.#registrationStatus === "none" || this.#registrationStatus === "in-progress") {
            throw new Error("[squide] The completeLocalModuleRegistration function can only be called once the registerLocalModules function terminated.");
        }

        if (this.#registrationStatus !== "registered" && this.#deferredRegistrations.length > 0) {
            throw new Error("[squide] The completeLocalModuleRegistration function can only be called once.");
        }

        if (this.#registrationStatus === "ready") {
            // No deferred registrations were returned by the local modules, skip the completion process.
            return Promise.resolve(errors);
        }

        this.#setRegistrationStatus("completing-deferred-registrations");

        await Promise.allSettled(this.#deferredRegistrations.map(async ({ index, fct: deferredRegister }) => {
            runtime.logger.debug(`[squide] ${index} Completing local module deferred registration.`, "Data:", data);

            try {
                await deferredRegister(data);
            } catch (error: unknown) {
                runtime.logger.error(
                    `[squide] ${index} An error occured while completing the registration of a local module.`,
                    error
                );

                errors.push({
                    error
                });
            }

            runtime.logger.debug(`[squide] ${index} Completed local module deferred registration.`);
        }));

        this.#setRegistrationStatus("ready");

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

    // Strictly for Jest tests, this is NOT ideal.
    __reset() {
        // Bypass the "setRegistrationStatus" function to prevent calling the listeners.
        this.#registrationStatus = "none";
        this.#deferredRegistrations = [];
        this.#statusChangedListeners.clear();
    }
}

const localModuleRegistry = new LocalModuleRegistry();

export function registerLocalModules<TRuntime extends Runtime = Runtime, TContext = unknown, TData = unknown>(registerFunctions: ModuleRegisterFunction<TRuntime, TContext, TData>[], runtime: TRuntime, options?: RegisterLocalModulesOptions<TContext>) {
    return localModuleRegistry.registerModules(registerFunctions, runtime, options);
}

export function completeLocalModuleRegistrations<TRuntime extends Runtime = Runtime, TData = unknown>(runtime: TRuntime, data?: TData) {
    return localModuleRegistry.completeModuleRegistrations(runtime, data);
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

// Strictly for Jest tests, this is NOT ideal.
export function __resetLocalModuleRegistrations() {
    localModuleRegistry.__reset();
}
