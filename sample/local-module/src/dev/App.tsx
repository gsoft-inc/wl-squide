import { useAppRouter } from "@sample/shell";
import { sessionManager } from "./session.ts";

export function App() {
    return useAppRouter(process.env.USE_MSW as unknown as boolean, sessionManager);
}
