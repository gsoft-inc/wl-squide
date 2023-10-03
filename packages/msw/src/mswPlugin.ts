import { Plugin } from "@squide/core";
import type { RestHandler } from "msw";
import { RequestHandlerRegistry } from "./requestHandlerRegistry.ts";

const Name = "MswPlugin";

export class MswPlugin extends Plugin {
    readonly #requestHandlerRegistry = new RequestHandlerRegistry();

    constructor() {
        super(Name);
    }

    registerRequestHandlers(handlers: RestHandler[]) {
        this.#requestHandlerRegistry.add(handlers);
    }

    get requestHandlers(): RestHandler[] {
        return this.#requestHandlerRegistry.handlers;
    }
}

export function getMswPlugin(plugins: Plugin[]) {
    const plugin = plugins.find(x => x.name === Name);

    if (!plugin) {
        throw new Error("[squide] Cannot find MSW plugin. Did you added an instance of the MswPlugin class to your application Runtime?");
    }

    return plugin as MswPlugin;
}
