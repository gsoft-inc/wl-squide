import { LocalStorageSessionManager } from "@squide/fakes";

export interface Session {
    userId: number;
    username: string;
}

export const sessionManager = new LocalStorageSessionManager<Session>({ key: "squide-sample-msw-session" });
