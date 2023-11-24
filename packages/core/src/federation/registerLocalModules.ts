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

export interface LocalModuleRegistrationError {
    // The registration error.
    error: unknown;
}

export class LocalModuleRegistry {
    #registrationStatus: ModuleRegistrationStatus = "none";
    #deferredRegistrations: DeferredRegistration[] = [];

    async registerModules<TRuntime extends Runtime = Runtime, TContext = unknown, TData = unknown>(registerFunctions: ModuleRegisterFunction<TRuntime, TContext, TData>[], runtime: TRuntime, { context }: RegisterLocalModulesOptions<TContext> = {}) {
        const errors: LocalModuleRegistrationError[] = [];

        if (this.#registrationStatus !== "none") {
            throw new Error("[squide] The registerLocalModules function can only be called once.");
        }

        runtime.logger.debug(`[squide] Found ${registerFunctions.length} local module${registerFunctions.length !== 1 ? "s" : ""} to register.`);

        this.#registrationStatus = "in-progress";

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

        this.#registrationStatus = this.#deferredRegistrations.length > 0 ? "registered" : "ready";

        return errors;
    }

    async completeModuleRegistrations<TRuntime extends Runtime = Runtime, TData = unknown>(runtime: TRuntime, data: TData) {
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

        this.#registrationStatus = "in-completion";

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

        this.#registrationStatus = "ready";

        return errors;
    }

    get registrationStatus() {
        return this.#registrationStatus;
    }

    // Strictly for Jest tests, this is NOT ideal.
    __reset() {
        this.#registrationStatus = "none";
        this.#deferredRegistrations = [];
    }
}

const localModuleRegistry = new LocalModuleRegistry();

export function registerLocalModules<TRuntime extends Runtime = Runtime, TContext = unknown, TData = unknown>(registerFunctions: ModuleRegisterFunction<TRuntime, TContext, TData>[], runtime: TRuntime, options?: RegisterLocalModulesOptions<TContext>) {
    return localModuleRegistry.registerModules(registerFunctions, runtime, options);
}

export function completeLocalModuleRegistrations<TRuntime extends Runtime = Runtime, TData = unknown>(runtime: TRuntime, data: TData) {
    return localModuleRegistry.completeModuleRegistrations(runtime, data);
}

export function getLocalModuleRegistrationStatus() {
    return localModuleRegistry.registrationStatus;
}

// Strictly for Jest tests, this is NOT ideal.
export function __resetLocalModuleRegistrations() {
    localModuleRegistry.__reset();
}
