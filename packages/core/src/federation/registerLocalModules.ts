import { isFunction } from "../index.ts";
import type { AbstractRuntime } from "../runtime/abstractRuntime.ts";
import type { ModuleRegistrationStatus } from "./moduleRegistrationStatus.ts";
import { registerModule, type DeferredRegisterationFunction, type ModuleRegisterFunction } from "./registerModule.ts";

interface DeferredRegisteration {
    index: string;
    fct: DeferredRegisterationFunction;
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

    readonly #deferredRegistrations: DeferredRegisteration[] = [];

    async registerModules<TRuntime extends AbstractRuntime = AbstractRuntime, TContext = unknown>(registerFunctions: ModuleRegisterFunction<TRuntime, TContext>[], runtime: TRuntime, { context }: RegisterLocalModulesOptions<TContext> = {}) {
        const errors: LocalModuleRegistrationError[] = [];

        if (this.#registrationStatus !== "none") {
            throw new Error("[squide] [local] The registerLocalModules function can only be called once.");
        }

        runtime.logger.debug(`[squide] [local] Found ${registerFunctions.length} local module${registerFunctions.length !== 1 ? "s" : ""} to register.`);

        this.#registrationStatus = "in-progress";

        await Promise.allSettled(registerFunctions.map(async (x, index) => {
            runtime.logger.debug(`[squide] [local] ${index + 1}/${registerFunctions.length} Registering local module.`);

            try {
                const optionalDeferedRegistration = await registerModule(x as ModuleRegisterFunction<AbstractRuntime>, runtime, context);

                if (isFunction(optionalDeferedRegistration)) {
                    this.#deferredRegistrations.push({
                        index: `${index + 1}/${registerFunctions.length}`,
                        fct: optionalDeferedRegistration
                    });
                }
            } catch (error: unknown) {
                runtime.logger.error(
                    `[squide] [local] ${index + 1}/${registerFunctions.length} An error occured while registering a local module.`,
                    error
                );

                errors.push({
                    error
                });
            }

            runtime.logger.debug(`[squide] [local] ${index + 1}/${registerFunctions.length} Local module registration completed.`);
        }));

        this.#registrationStatus = this.#deferredRegistrations.length > 0 ? "registered" : "ready";

        return errors;
    }

    async completeRegistrations<TRuntime extends AbstractRuntime = AbstractRuntime, TData = unknown>(runtime: TRuntime, data?: TData) {
        const errors: LocalModuleRegistrationError[] = [];

        if (this.#registrationStatus === "none" || this.#registrationStatus === "in-progress") {
            throw new Error("[squide] [local] The completeLocalModuleRegistration function can only be called once the registerLocalModules function terminated.");
        }

        if (this.#registrationStatus !== "registered" && this.#deferredRegistrations.length > 0) {
            throw new Error("[squide] [local] The completeLocalModuleRegistration function can only be called once.");
        }

        if (this.#registrationStatus === "ready") {
            // No defered registrations were returned by the local modules, skip the completion process.
            return Promise.resolve(errors);
        }

        this.#registrationStatus = "in-completion";

        await Promise.allSettled(this.#deferredRegistrations.map(async ({ index, fct: deferredRegister }) => {
            runtime.logger.debug(`[squide] [local] ${index} Completing local module deferred registration.`);

            try {
                await deferredRegister(data);
            } catch (error: unknown) {
                runtime.logger.error(
                    `[squide] [local] ${index} An error occured while completing the registration of a local module.`,
                    error
                );

                errors.push({
                    error
                });
            }

            runtime.logger.debug(`[squide] [local] ${index} Completed local module deferred registration.`);
        }));

        this.#registrationStatus = "ready";

        return errors;
    }

    get registrationStatus() {
        return this.#registrationStatus;
    }
}

const localModuleRegistry = new LocalModuleRegistry();

export function registerLocalModules<TRuntime extends AbstractRuntime = AbstractRuntime, TContext = unknown>(registerFunctions: ModuleRegisterFunction<TRuntime, TContext>[], runtime: TRuntime, options?: RegisterLocalModulesOptions<TContext>) {
    return localModuleRegistry.registerModules(registerFunctions, runtime, options);
}

export function completeLocalModuleRegistrations<TRuntime extends AbstractRuntime = AbstractRuntime, TData = unknown>(runtime: TRuntime, data?: TData) {
    return localModuleRegistry.completeRegistrations(runtime, data);
}

export function getLocalModulesRegistrationStatus() {
    return localModuleRegistry.registrationStatus;
}
