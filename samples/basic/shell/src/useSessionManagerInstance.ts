import type { Session, SessionManager } from "@basic/shared";
import { useMemo } from "react";

class InMemorySessionManager implements SessionManager {
    #session: Session | undefined;

    setSession(session: Session) {
        this.#session = session;
    }

    getSession() {
        return this.#session;
    }

    clearSession() {
        this.#session = undefined;
    }
}

export function useSessionManagerInstance() {
    return useMemo(() => new InMemorySessionManager(), []);
}
