import { useLogger } from "@squide/core";
import { useEffect, useState } from "react";
import { isMswStarted } from "./setMswAsStarted.ts";

export interface UseIsMswStartedOptions {
    // The interval is in milliseconds.
    interval?: number;
}

export function useIsMswStarted(enabled: boolean, { interval = 10 }: UseIsMswStartedOptions = {}) {
    const logger = useLogger();

    // Using a state hook to force a rerender once MSW is started.
    const [value, setIsStarted] = useState(!enabled);

    // Perform a reload once MSW is started.
    useEffect(() => {
        if (enabled) {
            const intervalId = setInterval(() => {
                if (isMswStarted()) {
                    logger.debug("[squide] %cMSW is ready%c.", "color: white; background-color: green;", "");

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
