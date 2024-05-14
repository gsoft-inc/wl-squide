import { LoggerTelemetryService } from "@endpoints/shared";
import { AppRouter } from "@endpoints/shell";
import { useLogger } from "@squide/firefly";
import { QueryProvider } from "../QueryProvider.tsx";
import { sessionManager } from "./session.ts";

export function App() {
    const logger = useLogger();

    const telemetryService = new LoggerTelemetryService(logger);

    return (
        <QueryProvider>
            <AppRouter
                waitForMsw={!!process.env.USE_MSW}
                sessionManager={sessionManager}
                telemetryService={telemetryService}
            />
        </QueryProvider>
    );
}
