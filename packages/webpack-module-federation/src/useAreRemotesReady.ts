import { useEffect, useState } from "react";

import { registrationStatus } from "./registerRemoteModules.ts";

export interface UseAreRemotesReadyOptions {
    // The interval is in milliseconds.
    interval?: number;
}

export function useAreRemotesReady({ interval = 10 }: UseAreRemotesReadyOptions = {}) {
    // Using a state hook to force a rerender once ready.
    const [, isReady] = useState(false);

    // Perform a reload once the modules are registered.
    useEffect(() => {
        const intervalId = setInterval(() => {
            if (registrationStatus === "ready") {
                clearInterval(intervalId);
                isReady(true);
            }
        }, interval);

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, []);

    return registrationStatus === "ready";
}
