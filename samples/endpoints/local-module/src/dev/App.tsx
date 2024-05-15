import { LoggerTelemetryService } from "@endpoints/shared";
import { AppRouter } from "@endpoints/shell";
import { useLogger } from "@squide/firefly";
import { QueryProvider } from "../QueryProvider.tsx";

export function App() {
    const logger = useLogger();

    const telemetryService = new LoggerTelemetryService(logger);

    return (
        <QueryProvider>
            <AppRouter
                waitForMsw={!!process.env.USE_MSW}
                telemetryService={telemetryService}
            />
        </QueryProvider>
    );
}
