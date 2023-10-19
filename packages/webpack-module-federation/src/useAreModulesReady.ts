import { useEffect, useState } from "react";

import { getLocalModulesRegistrationStatus, useRuntime } from "@squide/core";
import { getRemoteModulesRegistrationStatus } from "./registerRemoteModules.ts";

export interface UseAreModulesReadyOptions {
    // The interval is in milliseconds.
    interval?: number;
}

function areModulesReady() {
    // Validating for "in-progress" instead of "ready" for the local module because "registerLocalModules"
    // could never be called.
    return getLocalModulesRegistrationStatus() !== "in-progress" && getRemoteModulesRegistrationStatus() !== "in-progress";
}

export function useAreModulesReady({ interval = 10 }: UseAreModulesReadyOptions = {}) {
    const runtime = useRuntime();

    // Using a state hook to force a rerender once ready.
    const [value, setAreModulesReady] = useState(false);

    // Perform a reload once the modules are registered.
    useEffect(() => {
        const intervalId = setInterval(() => {
            if (areModulesReady()) {
                // Must clear interval before calling "_completeRegistration" in case there's an error.
                clearInterval(intervalId);

                runtime._completeRegistration();

                setAreModulesReady(true);
            }
        }, interval);

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, []);

    return value;
}
