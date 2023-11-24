import { isNil, isNilOrEmpty } from "@squide/core";

export interface ReadonlyLocalStorageOptions {
    key?: string;
}

export class ReadonlyLocalStorage<T = unknown> {
    readonly #key: string;
    #cache?: T = undefined;

    constructor({ key = "app-session" }: ReadonlyLocalStorageOptions = {}) {
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
