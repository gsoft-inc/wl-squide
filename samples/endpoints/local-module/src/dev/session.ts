import type { Session } from "@endpoints/shared";
import { LocalStorageSessionManager } from "@squide/fakes";
import type { SessionAccessorFunction } from "@squide/firefly";

export const sessionManager = new LocalStorageSessionManager<Session>();

export const sessionAccessor: SessionAccessorFunction = () => {
    return sessionManager.getSession();
};
