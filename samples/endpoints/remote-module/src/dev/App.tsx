import { LoggerTelemetryService } from "@endpoints/shared";
import { AppRouter } from "@endpoints/shell";
import { useLogger } from "@squide/firefly";
import { sessionManager } from "./session.ts";

export function App() {
    const logger = useLogger();

    const telemetryService = new LoggerTelemetryService(logger);

    return (
        <AppRouter
            waitForMsw={!!process.env.USE_MSW}
            sessionManager={sessionManager}
            telemetryService={telemetryService}
        />
    );
}

