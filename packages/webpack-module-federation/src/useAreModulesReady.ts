import { useEffect, useState } from "react";

import { getLocalModuleRegistrationStatus, useRuntime, type ModuleRegistrationStatus } from "@squide/core";
import { getRemoteModuleRegistrationStatus } from "./registerRemoteModules.ts";

export interface UseAreModulesReadyOptions {
    // The interval is in milliseconds.
    interval?: number;
}

export function areModulesReady(localModuleRegistrationStatus: ModuleRegistrationStatus, remoteModuleRegistrationStatus: ModuleRegistrationStatus) {
    if (localModuleRegistrationStatus === "none" && remoteModuleRegistrationStatus === "none") {
        return false;
    }

    // The registration for local or remote modules could be "none" if an application doesn't register either local or remote modules.
    return (localModuleRegistrationStatus === "none" || localModuleRegistrationStatus === "ready") &&
           (remoteModuleRegistrationStatus === "none" || remoteModuleRegistrationStatus === "ready");
}

export function useAreModulesReady({ interval = 10 }: UseAreModulesReadyOptions = {}) {
    const runtime = useRuntime();

    // Using a state hook to force a rerender once ready.
    const [value, setAreModulesReady] = useState(areModulesReady(getLocalModuleRegistrationStatus(), getRemoteModuleRegistrationStatus()));

    // Perform a reload once the modules are registered.
    useEffect(() => {
        if (!value) {
            const intervalId = setInterval(() => {
                if (areModulesReady(getLocalModuleRegistrationStatus(), getRemoteModuleRegistrationStatus())) {
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
        }
    }, []);

    return value;
}
