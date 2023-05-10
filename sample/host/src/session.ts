import type { Session } from "shared";
import type { SessionAccessorFunction } from "@squide/react-router";
import { SessionManager } from "@squide/fakes";

export const sessionManager = new SessionManager<Session>();

export const sessionAccessor: SessionAccessorFunction = () => {
    return sessionManager.getSession();
};
