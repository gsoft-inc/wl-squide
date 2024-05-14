import { useLogOnceLogger } from "@squide/core";
import { useEffect, useSyncExternalStore } from "react";
import { addMswStateChangedListener, isMswReady, removeMswStateChangedListener } from "./mswState.ts";

function subscribe(callback: () => void) {
    addMswStateChangedListener(callback);

    return () => removeMswStateChangedListener(callback);
}

export function useIsMswReady(enabled: boolean) {
    const isReady = useSyncExternalStore(subscribe, isMswReady);

    const logger = useLogOnceLogger();

    useEffect(() => {
        if (isReady) {
            // Adding a guard to log once so React strict mode doesn't mess up with the logs when in development.
            logger.debugOnce("msw-is-started", "[squide] %cMSW is ready%c.", "color: white; background-color: green;", "");
        }
    }, [isReady, logger]);

    return isReady || !enabled;
}
