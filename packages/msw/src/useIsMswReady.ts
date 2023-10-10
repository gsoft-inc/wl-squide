import { useLogger, useRuntime } from "@squide/core";
import { useEffect, useState } from "react";
import { getMswPlugin } from "./mswPlugin.ts";

export interface UseIsMswStartedOptions {
    // The interval is in milliseconds.
    interval?: number;
}

export function useIsMswStarted(enabled: boolean, { interval = 10 }: UseIsMswStartedOptions = {}) {
    const runtime = useRuntime();
    const logger = useLogger();

    const mswPlugin = getMswPlugin(runtime);

    // Using a state hook to force a rerender once MSW is started.
    const [value, setIsStarted] = useState(!enabled);

    // Perform a reload once MSW is started.
    useEffect(() => {
        if (enabled) {
            const intervalId = setInterval(() => {
                if (mswPlugin.isStarted) {
                    logger.debug("[squide] MSW is ready.");

                    // Must clear interval before calling "_completeRegistration" in case there's an error.
                    clearInterval(intervalId);
                    setIsStarted(true);
                }
            }, interval);

            return () => {
                if (intervalId) {
                    clearInterval(intervalId);
                }
            };
        }
    }, [enabled]);

    return value;
}
