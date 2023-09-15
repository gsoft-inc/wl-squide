import type { Session, SessionManager } from "@sample/shared";
import { LocalStorageSessionManager } from "@squide/fakes";
import type { SessionAccessorFunction } from "@squide/react-router";

export const sessionManager = new LocalStorageSessionManager<Session>() as SessionManager;

export const sessionAccessor: SessionAccessorFunction = () => {
    return sessionManager.getSession();
};
