import { useAppRouter } from "@sample/shell";
import { sessionManager } from "./session.ts";

export function App() {
    return useAppRouter(sessionManager, {
        waitForMsw: process.env.USE_MSW as unknown as boolean
    });
}
