import { ReadonlyLocalStorage } from "@squide/fakes";

export interface Session {
    userId: number;
    username: string;
    preferredLanguage: string;
}

export const readonlyLocalStorage = new ReadonlyLocalStorage<Session>({ key: "squide-endpoints-msw-session" });
