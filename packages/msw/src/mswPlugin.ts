import { Plugin, isNil, type Runtime } from "@squide/core";
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

export function getMswPlugin(runtime: Runtime) {
    const plugin = runtime.getPlugin(MswPlugin.name);

    if (isNil(plugin)) {
        throw new Error("[squide] The getMswPlugin function is called but no MswPlugin instance has been registered with the runtime.");
    }

    return plugin as MswPlugin;
}
