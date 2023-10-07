import type { Session } from "@sample/shared";
import { LocalStorageSessionManager } from "@squide/fakes";
import type { SessionAccessorFunction } from "@squide/react-router";

export const sessionManager = new LocalStorageSessionManager<Session>();

export const sessionAccessor: SessionAccessorFunction = () => {
    return sessionManager.getSession();
};

export async function onLogin(username: string) {
    const session: Session = {
        user: {
            name: username
        }
    };

    sessionManager.setSession(session);
}

export async function onLogout() {
    sessionManager.clearSession();
}
