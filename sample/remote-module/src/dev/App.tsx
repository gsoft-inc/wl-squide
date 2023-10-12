import { BackgroundColorContext, LoggerTelemetryService } from "@sample/shared";
import { useAppRouter } from "@sample/shell";
import { useLogger } from "@squide/react-router";
import { sessionManager } from "./session.ts";

export function App() {
    const logger = useLogger();

    const telemetryService = new LoggerTelemetryService(logger);

    const appRouter = useAppRouter(process.env.USE_MSW as unknown as boolean, sessionManager, telemetryService);

    return (
        <BackgroundColorContext.Provider value="blue">
            {appRouter}
        </BackgroundColorContext.Provider>
    );
}

