import type { AbstractRuntime } from "../runtime/abstractRuntime.ts";

// TODO: Alex, helppppp!
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DeferredRegisterationFunction = (data?: any) => Promise<void> | void;

export type ModuleRegisterFunction<TRuntime extends AbstractRuntime = AbstractRuntime, TContext = unknown> = (runtime: TRuntime, context?: TContext) => Promise<DeferredRegisterationFunction> | DeferredRegisterationFunction | Promise<void> | void;

export async function registerModule(register: ModuleRegisterFunction, runtime: AbstractRuntime, context?: unknown) {
    return register(runtime, context);
}
