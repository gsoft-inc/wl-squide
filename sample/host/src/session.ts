import type { Session } from "@sample/shared";
import { SessionManager } from "@squide/fakes";
import type { SessionAccessorFunction } from "@squide/react-router";

export const sessionManager = new SessionManager<Session>();

export const sessionAccessor: SessionAccessorFunction = () => {
    return sessionManager.getSession();
};
