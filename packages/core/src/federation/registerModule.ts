import type { AbstractRuntime } from "../runtime/abstractRuntime.ts";

export type ModuleRegisterFunction<TRuntime extends AbstractRuntime = AbstractRuntime, TContext= unknown> = (runtime: TRuntime, context?: TContext) => void;

export function registerModule(register: ModuleRegisterFunction, runtime: AbstractRuntime, context?: unknown) {
    register(runtime, context);
}
