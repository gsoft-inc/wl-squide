import type { RegisterRouteOptions, RuntimeOptions } from "@squide/core";
import { MswPlugin } from "@squide/msw";
import { ReactRouterRuntime, type Route } from "@squide/react-router";
import type { RequestHandler } from "msw";
import { getAreModulesReady, getAreModulesRegistered } from "./AppRouterReducer.ts";

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

    registerRoute(route: Route, options: RegisterRouteOptions = {}) {
        console.log("*****************************************************", getAreModulesRegistered(), getAreModulesReady(), route);

        if (getAreModulesRegistered()) {
            throw new Error("[squide] Cannot register a route once the modules are registered. Are you trying to register a route in a deferred registration function? Only navigation items can be registered in a deferred registration function.");
        }

        super.registerRoute(route, options);
    }

    get isMswEnabled() {
        return this.#useMsw;
    }
}
