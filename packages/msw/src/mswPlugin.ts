import { Plugin, isNil, type Runtime } from "@squide/core";
import type { RequestHandler } from "msw";
import { RequestHandlerRegistry } from "./requestHandlerRegistry.ts";

export const MswPluginName = "msw-plugin";

export class MswPlugin extends Plugin {
    readonly #requestHandlerRegistry = new RequestHandlerRegistry();

    constructor(runtime: Runtime) {
        super(MswPluginName, runtime);
    }

    registerRequestHandlers(handlers: RequestHandler[]) {
        this.#requestHandlerRegistry.add(handlers);

        this._runtime.logger.debug("[squide] The following MSW request handlers has been registered: ", handlers);
    }

    get requestHandlers(): RequestHandler[] {
        return this.#requestHandlerRegistry.handlers;
    }
}

export function getMswPlugin(runtime: Runtime) {
    const plugin = runtime.getPlugin(MswPluginName);

    if (isNil(plugin)) {
        throw new Error("[squide] The getMswPlugin function is called but no MswPlugin instance has been registered with the runtime.");
    }

    return plugin as MswPlugin;
}
