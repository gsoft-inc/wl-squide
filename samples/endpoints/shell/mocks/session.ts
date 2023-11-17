import { FakeSessionKey, type LanguageKey } from "@endpoints/shared";
import { LocalStorageSessionManager } from "@squide/fakes";

export interface Session {
    userId: number;
    username: string;
    preferredLanguage: LanguageKey;
}

export const sessionManager = new LocalStorageSessionManager<Session>({ key: FakeSessionKey });
