import { FakeSessionKey } from "@endpoints/shared";
import { ReadonlyLocalStorage } from "@squide/fakes";

export interface Session {
    userId: number;
    username: string;
    preferredLanguage: string;
}

export const readonlyLocalStorage = new ReadonlyLocalStorage<Session>({ key: FakeSessionKey });
