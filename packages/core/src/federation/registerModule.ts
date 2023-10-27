import type { AbstractRuntime } from "../runtime/abstractRuntime.ts";

export type DeferredRegisterationFunction<TData = unknown> = (data?: TData) => Promise<void> | void;

export type ModuleRegisterFunction<TRuntime extends AbstractRuntime = AbstractRuntime, TContext = unknown, TData = unknown> = (runtime: TRuntime, context?: TContext) => Promise<DeferredRegisterationFunction<TData> | void> | DeferredRegisterationFunction<TData> | void;

export async function registerModule< TRuntime extends AbstractRuntime = AbstractRuntime, TContext = unknown, TData = unknown>(register: ModuleRegisterFunction<TRuntime, TContext, TData>, runtime: TRuntime, context?: TContext) {
    return register(runtime, context);
}
