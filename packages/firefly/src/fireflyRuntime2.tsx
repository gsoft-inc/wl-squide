import type { RuntimeOptions } from "@squide/core";
import { MswPlugin } from "@squide/msw";
import { ReactRouterRuntime } from "@squide/react-router";
import type { RequestHandler } from "msw";

export interface FireflyRuntimeOptions extends RuntimeOptions {
    useMsw?: boolean;
}

export class FireflyRuntime extends ReactRouterRuntime {
    readonly #mswPlugin?: MswPlugin;
    readonly #useMsw: boolean;

    constructor({ plugins, useMsw, ...options }: FireflyRuntimeOptions = {}) {
        if (useMsw) {
            const mswPlugin = new MswPlugin();

            super({
                plugins: [
                    ...(plugins ?? []),
                    mswPlugin
                ],
                ...options
            });

            this.#mswPlugin = mswPlugin;
            this.#useMsw = true;
        } else {
            super({
                plugins,
                ...options
            });

            this.#useMsw = false;
        }
    }

    registerRequestHandlers(handlers: RequestHandler[]) {
        if (!this.#mswPlugin) {
            throw new Error("[squide] Cannot register the provided MSW request handlers because the runtime hasn't been initialized with MSW. Did you instanciate the FireflyRuntime with the \"useMsw\" option?");
        }

        this.#mswPlugin.registerRequestHandlers(handlers);
    }

    get requestHandlers(): RequestHandler[] {
        if (!this.#mswPlugin) {
            throw new Error("[squide] Cannot retrieve MSW request handlers because the runtime hasn't been initialized with MSW. Did you instanciate the FireflyRuntime with the \"useMsw\" option?");
        }

        return this.#mswPlugin.requestHandlers;
    }

    get isMswEnabled() {
        return this.#useMsw;
    }
}
