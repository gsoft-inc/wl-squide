import { isNil, isNilOrEmpty } from "@squide/core";
import { SessionLocalStorageKey } from "./sessionKey.ts";

export interface ReadonlySessionLocalStorageOptions {
    key?: string;
}

export class ReadonlySessionLocalStorage<T = unknown> {
    readonly #key: string;
    #cache?: T = undefined;

    constructor({ key = SessionLocalStorageKey }: ReadonlySessionLocalStorageOptions = {}) {
        this.#key = key;
    }

    getSession() {
        if (!isNil(this.#cache)) {
            return this.#cache;
        }

        const rawSession = window.localStorage.getItem(this.#key);

        if (!isNilOrEmpty(rawSession)) {
            this.#cache = JSON.parse(rawSession);

            return this.#cache;
        }

        return undefined;
    }
}
