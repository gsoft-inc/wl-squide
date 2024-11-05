import type { Runtime } from "../runtime/runtime.ts";

export enum LogLevel {
    debug = 0,
    information = 1,
    warning = 2,
    error = 3,
    critical = 4
}

export abstract class Logger {
    readonly #name: string;
    protected readonly _runtime: Runtime;

    constructor(name: string, runtime: Runtime) {
        this.#name = name;
        this._runtime = runtime;
    }

    get name() {
        return this.#name;
    }

    abstract debug(log: string, ...rest: unknown[]): Promise<unknown>;
    abstract information(log: string, ...rest: unknown[]): Promise<unknown>;
    abstract warning(log: string, ...rest: unknown[]): Promise<unknown>;
    abstract error(log: string, ...rest: unknown[]): Promise<unknown>;
    abstract critical(log: string, ...rest: unknown[]): Promise<unknown>;
}
