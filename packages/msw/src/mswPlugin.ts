import { Plugin, isNil, type Runtime } from "@squide/core";
import type { RequestHandler } from "msw";
import { RequestHandlerRegistry } from "./requestHandlerRegistry.ts";

export class MswPlugin extends Plugin {
    #runtime?: Runtime;

    readonly #requestHandlerRegistry = new RequestHandlerRegistry();

    constructor() {
        super(MswPlugin.name);
    }

    _setRuntime(runtime: Runtime) {
        this.#runtime = runtime;
    }

    registerRequestHandlers(handlers: RequestHandler[]) {
        this.#requestHandlerRegistry.add(handlers);

        this.#runtime?.logger.debug("[squide] The following MSW request handlers has been registered: ", handlers);
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
