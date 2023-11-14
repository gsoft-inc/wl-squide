import type { Runtime } from "../runtime/runtime.ts";

export type DeferredRegistrationFunction<TData = unknown> = (data?: TData) => Promise<void> | void;

export type ModuleRegisterFunction<TRuntime extends Runtime = Runtime, TContext = unknown, TData = unknown> = (runtime: TRuntime, context?: TContext) => Promise<DeferredRegistrationFunction<TData> | void> | DeferredRegistrationFunction<TData> | void;

export async function registerModule<TRuntime extends Runtime = Runtime, TContext = unknown, TData = unknown>(register: ModuleRegisterFunction<TRuntime, TContext, TData>, runtime: TRuntime, context?: TContext) {
    return register(runtime, context);
}
