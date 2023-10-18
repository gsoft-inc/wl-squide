import { Plugin, type AbstractRuntime } from "@squide/core";
import type { RestHandler } from "msw";
import { RequestHandlerRegistry } from "./requestHandlerRegistry.ts";

export class MswPlugin extends Plugin {
    readonly #requestHandlerRegistry = new RequestHandlerRegistry();

    constructor() {
        super(MswPlugin.name);
    }

    registerRequestHandlers(handlers: RestHandler[]) {
        this.#requestHandlerRegistry.add(handlers);
    }

    get requestHandlers(): RestHandler[] {
        return this.#requestHandlerRegistry.handlers;
    }
}

export function getMswPlugin(runtime: AbstractRuntime) {
    return runtime.getPlugin(MswPlugin.name) as MswPlugin;
}
