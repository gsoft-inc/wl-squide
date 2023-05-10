import type { AbstractRuntime } from "../runtime/abstractRuntime.ts";
import type { ModuleRegisterFunction } from "./registerModule.ts";

export interface RegisterStaticModulesOptions {
    context?: unknown;
}

let isRegistered = false;

export function registerStaticModules(registerFunctions: ModuleRegisterFunction[], runtime: AbstractRuntime, { context }: RegisterStaticModulesOptions = {}) {
    if (isRegistered) {
        throw new Error("[squide] The \"registerRemoteModules\" function can only be called once.");
    }

    runtime.logger.information(`[squide] Found ${registerFunctions.length} static module${registerFunctions.length !== 1 ? "s" : ""} to register.`);

    registerFunctions.forEach((x, index) => {
        runtime.logger.information(`[squide] ${index + 1}/${registerFunctions.length} Registering static module.`);

        x(runtime, context);

        runtime.logger.information(`[squide] ${index + 1}/${registerFunctions.length} Registration completed.`);
    });

    isRegistered = true;
}
