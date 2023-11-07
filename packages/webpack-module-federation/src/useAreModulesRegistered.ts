import { useEffect, useState } from "react";

import { getLocalModuleRegistrationStatus, type ModuleRegistrationStatus } from "@squide/core";
import { getRemoteModuleRegistrationStatus } from "./registerRemoteModules.ts";

export interface UseAreModulesRegisteredOptions {
    // The interval is in milliseconds.
    interval?: number;
}

export function areModulesRegistered(localModuleRegistrationStatus: ModuleRegistrationStatus, remoteModuleRegistrationStatus: ModuleRegistrationStatus) {
    if (localModuleRegistrationStatus === "none" && remoteModuleRegistrationStatus === "none") {
        return false;
    }

    // The registration for local or remote modules could be "none" if an application doesn't register either local or remote modules.
    // The registration statuses could be at "ready" if there's no deferred registrations.
    return (localModuleRegistrationStatus === "none" || localModuleRegistrationStatus === "registered" || localModuleRegistrationStatus === "ready") &&
           (remoteModuleRegistrationStatus === "none" || remoteModuleRegistrationStatus === "registered" || remoteModuleRegistrationStatus === "ready");
}

export function useAreModulesRegistered({ interval = 10 }: UseAreModulesRegisteredOptions = {}) {
    // Using a state hook to force a rerender once registered.
    const [value, setAreModulesRegistered] = useState(areModulesRegistered(getLocalModuleRegistrationStatus(), getRemoteModuleRegistrationStatus()));

    // Perform a reload once the modules are registered.
    useEffect(() => {
        if (!value) {
            const intervalId = setInterval(() => {
                if (areModulesRegistered(getLocalModuleRegistrationStatus(), getRemoteModuleRegistrationStatus())) {
                    clearInterval(intervalId);

                    setAreModulesRegistered(true);
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
