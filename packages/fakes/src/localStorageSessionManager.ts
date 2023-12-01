import { isNil, isNilOrEmpty } from "@squide/core";
import { SessionLocalStorageKey } from "./sessionKey.ts";

export interface LocalStorageSessionManagerOptions {
    key?: string;
}

export class LocalStorageSessionManager<T = unknown> {
    readonly #key: string;
    #cache?: T = undefined;

    constructor({ key = SessionLocalStorageKey }: LocalStorageSessionManagerOptions = {}) {
        this.#key = key;
    }

    setSession(session: T) {
        if (isNil(session)) {
            window.localStorage.removeItem(this.#key);
        } else {
            window.localStorage.setItem(this.#key, JSON.stringify(session));
        }

        this.#cache = undefined;
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

    clearSession() {
        this.#cache = undefined;

        window.localStorage.removeItem(this.#key);
    }
}
