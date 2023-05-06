// Using "any" instead of "unknown" so modules can cast the "runtime" and "context" types in the function signature.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ModuleRegisterFunction = (runtime: any, context?: any) => void;

export function registerModule(register: ModuleRegisterFunction, runtime: unknown, context?: unknown) {
    register(runtime, context);
}
