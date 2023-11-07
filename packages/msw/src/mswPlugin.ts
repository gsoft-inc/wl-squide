import { Plugin, type AbstractRuntime } from "@squide/core";
import type { RequestHandler } from "msw";
import { RequestHandlerRegistry } from "./requestHandlerRegistry.ts";

export class MswPlugin extends Plugin {
    readonly #requestHandlerRegistry = new RequestHandlerRegistry();

    constructor() {
        super(MswPlugin.name);
    }

    registerRequestHandlers(handlers: RequestHandler[]) {
        this.#requestHandlerRegistry.add(handlers);
    }

    get requestHandlers(): RequestHandler[] {
        return this.#requestHandlerRegistry.handlers;
    }
}

export function getMswPlugin(runtime: AbstractRuntime) {
    return runtime.getPlugin(MswPlugin.name) as MswPlugin;
}
