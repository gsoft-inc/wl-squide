import { isNil, isNilOrEmpty } from "@squide/core";

export interface SessionManagerOptions {
    key?: string;
}

export class SessionManager<T = unknown> {
    private _key: string;
    private _cache?: T = undefined;

    constructor({ key = "app-session" }: SessionManagerOptions = {}) {
        this._key = key;
    }

    setSession(session: T) {
        if (isNil(session)) {
            window.localStorage.removeItem(this._key);
        } else {
            window.localStorage.setItem(this._key, JSON.stringify(session));
        }

        this._cache = undefined;
    }

    getSession() {
        if (this._cache) {
            return this._cache;
        }

        const rawSession = window.localStorage.getItem(this._key);

        if (!isNilOrEmpty(rawSession)) {
            this._cache = JSON.parse(rawSession);

            return this._cache;
        }

        return undefined;
    }

    clearSession() {
        this._cache = undefined;

        window.localStorage.removeItem(this._key);
    }
}
