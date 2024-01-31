import type { RuntimeOptions } from "@squide/core";
import { MswPlugin } from "@squide/msw";
import { ReactRouterRuntime } from "@squide/react-router";
import type { RequestHandler } from "msw";

export type FireflyRuntimeOptions = RuntimeOptions;

export class FireflyRuntime extends ReactRouterRuntime {
    readonly #mswPlugin: MswPlugin;

    constructor({ plugins, ...options }: FireflyRuntimeOptions = {}) {
        const mswPlugin = new MswPlugin();

        super({
            plugins: [
                ...(plugins ?? []),
                mswPlugin
            ],
            ...options
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
