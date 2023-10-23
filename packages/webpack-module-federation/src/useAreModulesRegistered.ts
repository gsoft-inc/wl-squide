import { useEffect, useState } from "react";

import { getLocalModulesRegistrationStatus } from "@squide/core";
import { getRemoteModulesRegistrationStatus } from "./registerRemoteModules.ts";

export interface UseAreModulesRegisteredOptions {
    // The interval is in milliseconds.
    interval?: number;
}

function areModulesRegistered() {
    return (getLocalModulesRegistrationStatus() === "none" || getLocalModulesRegistrationStatus() === "registered") &&
           (getRemoteModulesRegistrationStatus() === "none" || getRemoteModulesRegistrationStatus() === "registered");
}

export function useAreModulesRegistered({ interval = 10 }: UseAreModulesRegisteredOptions = {}) {
    // Using a state hook to force a rerender once registered.
    const [value, setAreModulesRegistered] = useState(false);

    // Perform a reload once the modules are registered.
    useEffect(() => {
        const intervalId = setInterval(() => {
            if (areModulesRegistered()) {
                clearInterval(intervalId);

                setAreModulesRegistered(true);
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
