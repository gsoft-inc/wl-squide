import type { Runtime } from "../runtime/runtime.ts";

export abstract class Plugin {
    readonly #name: string;
    protected readonly _runtime: Runtime;

    constructor(name: string, runtime: Runtime) {
        this.#name = name;
        this._runtime = runtime;
    }

    get name() {
        return this.#name;
    }
}
