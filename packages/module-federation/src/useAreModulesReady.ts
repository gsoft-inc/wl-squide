import { addLocalModuleRegistrationStatusChangedListener, getLocalModuleRegistrationStatus, removeLocalModuleRegistrationStatusChangedListener, useRuntime, type ModuleRegistrationStatus } from "@squide/core";
import { useEffect, useMemo, useSyncExternalStore } from "react";
import { addRemoteModuleRegistrationStatusChangedListener, getRemoteModuleRegistrationStatus, removeRemoteModuleRegistrationStatusChangedListener } from "./registerRemoteModules.ts";

export function areModulesReady(localModuleRegistrationStatus: ModuleRegistrationStatus, remoteModuleRegistrationStatus: ModuleRegistrationStatus) {
    if (localModuleRegistrationStatus === "none" && remoteModuleRegistrationStatus === "none") {
        return false;
    }

    // The registration for local or remote modules could be "none" if an application doesn't register either local or remote modules.
    return (localModuleRegistrationStatus === "none" || localModuleRegistrationStatus === "ready") &&
           (remoteModuleRegistrationStatus === "none" || remoteModuleRegistrationStatus === "ready");
}

function subscribeToLocalModuleRegistrationStatusChanged(callback: () => void) {
    addLocalModuleRegistrationStatusChangedListener(callback);

    return () => removeLocalModuleRegistrationStatusChangedListener(callback);
}

function subscribeToRemoteModuleRegistrationStatusChanged(callback: () => void) {
    addRemoteModuleRegistrationStatusChangedListener(callback);

    return () => removeRemoteModuleRegistrationStatusChangedListener(callback);
}

export function useAreModulesReady() {
    const localModuleStatus = useSyncExternalStore(subscribeToLocalModuleRegistrationStatusChanged, getLocalModuleRegistrationStatus);
    const remoteModuleStatus = useSyncExternalStore(subscribeToRemoteModuleRegistrationStatusChanged, getRemoteModuleRegistrationStatus);

    const runtime = useRuntime();

    useEffect(() => {
        if (areModulesReady(localModuleStatus, remoteModuleStatus)) {
            runtime._completeRegistration();
        }
    }, []);

    return useMemo(() => areModulesReady(localModuleStatus, remoteModuleStatus), [localModuleStatus, remoteModuleStatus]);
}
