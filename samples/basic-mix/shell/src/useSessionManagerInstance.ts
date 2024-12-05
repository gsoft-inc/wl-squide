import type { Session, SessionManager } from "@basic-mix/shared";
import { LocalStorageSessionManager } from "@squide/fakes";
import { useMemo } from "react";

class MySessionManager implements SessionManager {
    readonly #localStorageSessionManager = new LocalStorageSessionManager<Session>();

    setSession(session: Session) {
        this.#localStorageSessionManager.setSession(session);
    }

    getSession() {
        return this.#localStorageSessionManager.getSession();
    }

    clearSession() {
        this.#localStorageSessionManager.clearSession();
    }
}

export function useSessionManagerInstance() {
    return useMemo(() => new MySessionManager(), []);
}
