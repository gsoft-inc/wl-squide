import type { RequestHandler } from "msw";
import { isMswStarted } from "./setMswAsStarted.ts";

export class RequestHandlerRegistry {
    readonly #handlers: RequestHandler[] = [];

    add(handlers: RequestHandler[]) {
        if (isMswStarted()) {
            throw new Error("[squide] MSW request handlers cannot be registered once MSW is started. Did you defer the registration of a MSW request handler?");
        }

        this.#handlers.push(...handlers);
    }

    // Must specify the return type, otherwise we get a TS2742: The inferred type cannot be named without a reference to X. This is likely not portable.
    // A type annotation is necessary.
    get handlers(): RequestHandler[] {
        return this.#handlers;
    }
}

