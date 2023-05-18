import type { AbstractRuntime } from "../runtime/abstractRuntime.ts";
import type { ModuleRegisterFunction } from "./registerModule.ts";

export interface RegisterStaticModulesOptions<TAppContext = unknown> {
    context?: TAppContext;
}

let isRegistered = false;

export function registerStaticModules<TRuntime extends AbstractRuntime = AbstractRuntime, TAppContext = unknown>(registerFunctions: ModuleRegisterFunction<TRuntime, TAppContext>[], runtime: TRuntime, { context }: RegisterStaticModulesOptions<TAppContext> = {}) {
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
