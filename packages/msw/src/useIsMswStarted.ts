import { useLogOnceLogger } from "@squide/core";
import { useEffect, useSyncExternalStore } from "react";
import { addMswStateChangedListener, isMswStarted, removeMswStateChangedListener } from "./mswState.ts";

function subscribe(callback: () => void) {
    addMswStateChangedListener(callback);

    return () => removeMswStateChangedListener(callback);
}

export function useIsMswStarted(enabled: boolean) {
    const isStarted = useSyncExternalStore(subscribe, isMswStarted);

    const logger = useLogOnceLogger();

    useEffect(() => {
        if (isStarted) {
            // Adding a guard to log once so React strict mode doesn't mess up with the logs when in development.
            logger.debugOnce("msw-is-started", "[squide] %cMSW is ready%c.", "color: white; background-color: green;", "");
        }
    }, [isStarted, logger]);

    return isStarted || !enabled;
}
