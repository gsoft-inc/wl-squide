import { FakeSessionKey, type LanguageKey } from "@endpoints/shared";
import { ReadonlyLocalStorage } from "@squide/fakes";

export interface Session {
    userId: number;
    username: string;
    preferredLanguage: LanguageKey;
}

export const readonlyLocalStorage = new ReadonlyLocalStorage<Session>({ key: FakeSessionKey });
