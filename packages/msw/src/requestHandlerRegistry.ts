import type { RestHandler } from "msw";

export class RequestHandlerRegistry {
    readonly #handlers: RestHandler[] = [];

    add(handlers: RestHandler[]) {
        this.#handlers.push(...handlers);
    }

    get handlers(): RestHandler[] {
        return this.#handlers;
    }
}

