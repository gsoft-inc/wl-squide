import type { Logger } from "@squide/firefly";
import { createContext, useContext } from "react";

export interface TelemetryService {
    track: (value: string) => void;
}

export class LoggerTelemetryService implements TelemetryService {
    #logger: Logger;

    constructor(logger: Logger) {
        this.#logger = logger;
    }

    track(value: string) {
        this.#logger.information(`[telemetry] ${value}`);
    }
}

export const TelemetryServiceContext = createContext<TelemetryService | undefined>(undefined);

export function useTelemetryService() {
    return useContext(TelemetryServiceContext);
}
