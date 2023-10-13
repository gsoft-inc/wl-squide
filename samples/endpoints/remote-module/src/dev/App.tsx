import { LoggerTelemetryService } from "@endpoints/shared";
import { useAppRouter } from "@endpoints/shell";
import { useLogger } from "@squide/react-router";
import { sessionManager } from "./session.ts";

export function App() {
    const logger = useLogger();

    const telemetryService = new LoggerTelemetryService(logger);

    return useAppRouter(process.env.USE_MSW as unknown as boolean, sessionManager, telemetryService);
}

