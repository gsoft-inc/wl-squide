import { useLogger } from "@squide/core";
import { useEffect, useSyncExternalStore } from "react";
import { addMswStateChangedListener, isMswStarted, removeMswStateChangedListener } from "./mswState.ts";

function subscribe(callback: () => void) {
    addMswStateChangedListener(callback);

    return () => removeMswStateChangedListener(callback);
}

export function useIsMswStarted(enabled: boolean) {
    const isStarted = useSyncExternalStore(subscribe, isMswStarted);

    const logger = useLogger();

    useEffect(() => {
        if (isStarted) {
            logger.debug("[squide] %cMSW is ready%c.", "color: white; background-color: green;", "");
        }
    }, [isStarted, logger]);

    return isStarted || !enabled;
}
