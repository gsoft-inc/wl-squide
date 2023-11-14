import type { RuntimeOptions } from "@squide/core";
import { MswPlugin } from "@squide/msw";
import { ReactRouterRuntime } from "@squide/react-router";
import type { RequestHandler } from "msw";

export class FireflyRuntime extends ReactRouterRuntime {
    readonly #mswPlugin: MswPlugin;

    constructor(options: RuntimeOptions = {}) {
        const mswPlugin = new MswPlugin();

        super({
            ...options,
            plugins: [
                ...(options.plugins ?? []),
                mswPlugin
            ]
        });

        this.#mswPlugin = mswPlugin;
    }

    registerRequestHandlers(handlers: RequestHandler[]) {
        this.#mswPlugin.registerRequestHandlers(handlers);
    }

    get requestHandlers(): RequestHandler[] {
        return this.#mswPlugin.requestHandlers;
    }
}
