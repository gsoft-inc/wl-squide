export type ModuleRegisterFunction<TRuntime = unknown, TContext= unknown> = (runtime: TRuntime, context?: TContext) => void;

export function registerModule(register: ModuleRegisterFunction, runtime: unknown, context?: unknown) {
    register(runtime, context);
}
