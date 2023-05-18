import type { AbstractRuntime } from "../runtime/abstractRuntime.ts";

export type ModuleRegisterFunction<TRuntime extends AbstractRuntime = AbstractRuntime, TContext= unknown> = (runtime: TRuntime, context?: TContext) => void;

export function registerModule<TRuntime extends AbstractRuntime = AbstractRuntime, TContext= unknown>(register: ModuleRegisterFunction<TRuntime, TContext>, runtime: TRuntime, context?: TContext) {
    register(runtime, context);
}
