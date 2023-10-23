import { isFunction, type Logger } from "../index.ts";
import type { AbstractRuntime } from "../runtime/abstractRuntime.ts";
import type { ModuleRegistrationStatus } from "./moduleRegistrationStatus.ts";
import { registerModule, type DeferedRegisterationFunction, type ModuleRegisterFunction } from "./registerModule.ts";

let registrationStatus: ModuleRegistrationStatus = "none";

export function getLocalModulesRegistrationStatus() {
    return registrationStatus;
}

export function resetLocalModulesRegistrationStatus() {
    registrationStatus = "none";
}

interface DeferedRegisteration {
    index: string;
    fct: DeferedRegisterationFunction;
}

const deferedRegistrations: DeferedRegisteration[] = [];

export interface RegisterLocalModulesOptions<TContext> {
    context?: TContext;
}

export interface LocalModuleRegistrationError {
    // The registration error.
    error: unknown;
}

export async function registerLocalModules<TRuntime extends AbstractRuntime = AbstractRuntime, TContext = unknown>(registerFunctions: ModuleRegisterFunction<TRuntime, TContext>[], runtime: TRuntime, { context }: RegisterLocalModulesOptions<TContext> = {}) {
    if (registrationStatus !== "none") {
        throw new Error("[squide] [local] registerLocalModules() can only be called once.");
    }

    const errors: LocalModuleRegistrationError[] = [];

    runtime.logger.information(`[squide] [local] Found ${registerFunctions.length} local module${registerFunctions.length !== 1 ? "s" : ""} to register.`);

    registrationStatus = "in-progress";

    await Promise.allSettled(registerFunctions.map(async (x, index) => {
        runtime.logger.information(`[squide] [local] ${index + 1}/${registerFunctions.length} Registering local module.`);

        try {
            const optionalDeferedRegistration = await registerModule(x as ModuleRegisterFunction<AbstractRuntime>, runtime, context);

            if (isFunction(optionalDeferedRegistration)) {
                deferedRegistrations.push({
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

        runtime.logger.information(`[squide] [local] ${index + 1}/${registerFunctions.length} Local module registration completed.`);
    }));

    registrationStatus = deferedRegistrations.length > 0 ? "registered" : "ready";

    return errors;
}

export async function completeLocalModuleRegistration<TData = unknown>(logger: Logger, data?: TData) {
    if (registrationStatus === "none" || registrationStatus === "in-progress") {
        throw new Error("[squide] [local] completeLocalModuleRegistration() can only be called once registerLocalModules() terminated.");
    }

    if (registrationStatus !== "registered" && deferedRegistrations.length > 0) {
        throw new Error("[squide] [local] completeLocalModuleRegistration() can only be called once.");
    }

    if (registrationStatus === "ready") {
        // No defered registrations were returned by the local modules, skip the completion process.
        return Promise.resolve();
    }

    registrationStatus = "in-completion";

    const errors: LocalModuleRegistrationError[] = [];

    await Promise.allSettled(deferedRegistrations.map(({ index, fct }) => {
        let optionalPromise;

        logger.information(`[squide] [local] ${index} Completing local module deferred registration.`);

        try {
            optionalPromise = fct(data);
        } catch (error: unknown) {
            logger.error(
                `[squide] [local] ${index} An error occured while completing the registration of a local module.`,
                error
            );

            errors.push({
                error
            });
        }

        logger.information(`[squide] [local] ${index} Completed local module deferred registration.`);

        return optionalPromise;
    }));

    registrationStatus = "ready";

    return errors;
}


/*
Les states doivent être différent
    - Ça prends un state pour dire qu'ils sont tous loader mais pas 100% completed
    - Un autre state pour dire qu'ils le sont incluant les deferred

    -> What if, je ne veux pas gosser avec les defered registrations et je n'en utilise pas?!?!
        -> Je pourrais avoir une option initialement:  { supportDeferredRegistration: boolean - false par défaut }
        -> Probablement pas besoin, je vais juste regarder en fonction du nombre de deferredRegistrations
*/
