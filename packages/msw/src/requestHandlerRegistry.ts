import type { RestHandler } from "msw";

export class RequestHandlerRegistry {
    readonly #handlers: RestHandler[] = [];

    add(handlers: RestHandler[]) {
        this.#handlers.push(...handlers);
    }

    // Must specify the return type, otherwise we get the following error:
    // TS2742: The inferred type of 'handlers' cannot be named without a reference to X. This is likely not portable. A type annotation is necessary.
    get handlers(): RestHandler[] {
        return this.#handlers;
    }
}

