import type { Session, SessionManager } from "@endpoints/shared";
import type { SessionAccessorFunction } from "@squide/react-router";

export class InMemorySessionManager implements SessionManager {
    #session?: Session;

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

export const sessionManager = new InMemorySessionManager();

export const sessionAccessor: SessionAccessorFunction = () => {
    return sessionManager.getSession();
};
