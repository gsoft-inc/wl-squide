import { Plugin, type AbstractRuntime } from "@squide/core";
import type { RestHandler } from "msw";
import { RequestHandlerRegistry } from "./requestHandlerRegistry.ts";

export class MswPlugin extends Plugin {
    readonly #requestHandlerRegistry = new RequestHandlerRegistry();
    #isMswStarted = false;

    constructor() {
        super(MswPlugin.name);
    }

    registerRequestHandlers(handlers: RestHandler[]) {
        this.#requestHandlerRegistry.add(handlers);
    }

    get requestHandlers(): RestHandler[] {
        return this.#requestHandlerRegistry.handlers;
    }

    setAsStarted() {
        this.#isMswStarted = true;
    }

    get isStarted() {
        return this.#isMswStarted;
    }
}

export function getMswPlugin(runtime: AbstractRuntime) {
    return runtime.getPlugin(MswPlugin.name) as MswPlugin;
}
