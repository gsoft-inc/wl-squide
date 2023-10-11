import { BackgroundColorContext } from "@sample/shared";
import { useAppRouter } from "@sample/shell";
import { sessionManager } from "./session.ts";

export function App() {
    const appRouter = useAppRouter(sessionManager, {
        waitForMsw: process.env.USE_MSW as unknown as boolean
    });

    return (
        <BackgroundColorContext.Provider value="blue">
            {appRouter}
        </BackgroundColorContext.Provider>
    );
}

