import { useEffect, useState } from "react";

import { localModulesRegistrationStatus, useRuntime } from "@squide/core";
import { remoteModulesRegistrationStatus } from "./registerRemoteModules.ts";

export interface UseAreModulesReadyOptions {
    // The interval is in milliseconds.
    interval?: number;
}

function isReady() {
    // Validating for "in-progress" instead of "ready" for the local module because "registerLocalModules"
    // could never be called.
    return localModulesRegistrationStatus !== "in-progress" && remoteModulesRegistrationStatus === "ready";
}

export function useAreModulesReady({ interval = 10 }: UseAreModulesReadyOptions = {}) {
    const runtime = useRuntime();

    // Using a state hook to force a rerender once ready.
    const [, setIsReady] = useState(false);

    // Perform a reload once the modules are registered.
    useEffect(() => {
        const intervalId = setInterval(() => {
            if (isReady()) {
                // Must clear interval before calling "_completeRegistration" in case there's an error.
                clearInterval(intervalId);

                runtime._completeRegistration();

                setIsReady(true);
            }
        }, interval);

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, []);

    return isReady();
}
