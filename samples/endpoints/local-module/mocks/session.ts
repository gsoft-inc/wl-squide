import { FakeSessionStorageKey } from "@endpoints/shared";
import { ReadonlySessionLocalStorage } from "@squide/fakes";

export interface Session {
    userId: number;
    username: string;
    preferredLanguage: string;
}

export const readonlySessionLocalStorage = new ReadonlySessionLocalStorage<Session>({ key: FakeSessionStorageKey });
