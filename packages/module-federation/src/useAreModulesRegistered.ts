import { addLocalModuleRegistrationStatusChangedListener, getLocalModuleRegistrationStatus, removeLocalModuleRegistrationStatusChangedListener, type ModuleRegistrationStatus } from "@squide/core";
import { useMemo, useSyncExternalStore } from "react";
import { addRemoteModuleRegistrationStatusChangedListener, getRemoteModuleRegistrationStatus, removeRemoteModuleRegistrationStatusChangedListener } from "./registerRemoteModules.ts";

export function areModulesRegistered(localModuleRegistrationStatus: ModuleRegistrationStatus, remoteModuleRegistrationStatus: ModuleRegistrationStatus) {
    if (localModuleRegistrationStatus === "none" && remoteModuleRegistrationStatus === "none") {
        return false;
    }

    // The registration for local or remote modules could be "none" if an application doesn't register either local or remote modules.
    // The registration for local or remote modules could be "completing-deferred-registrationsn" if an application is currently going through the deferred registrations.
    // The registration statuses could be at "ready" if there's no deferred registrations.
    return (localModuleRegistrationStatus === "none" || localModuleRegistrationStatus === "registered" || localModuleRegistrationStatus === "completing-deferred-registrations" || localModuleRegistrationStatus === "ready") &&
           (remoteModuleRegistrationStatus === "none" || remoteModuleRegistrationStatus === "registered" || localModuleRegistrationStatus === "completing-deferred-registrations" || remoteModuleRegistrationStatus === "ready");
}

function subscribeToLocalModuleRegistrationStatusChanged(callback: () => void) {
    addLocalModuleRegistrationStatusChangedListener(callback);

    return () => removeLocalModuleRegistrationStatusChangedListener(callback);
}

function subscribeToRemoteModuleRegistrationStatusChanged(callback: () => void) {
    addRemoteModuleRegistrationStatusChangedListener(callback);

    return () => removeRemoteModuleRegistrationStatusChangedListener(callback);
}

export function useAreModulesRegistered() {
    const localModuleStatus = useSyncExternalStore(subscribeToLocalModuleRegistrationStatusChanged, getLocalModuleRegistrationStatus);
    const remoteModuleStatus = useSyncExternalStore(subscribeToRemoteModuleRegistrationStatusChanged, getRemoteModuleRegistrationStatus);

    return useMemo(() => areModulesRegistered(localModuleStatus, remoteModuleStatus), [localModuleStatus, remoteModuleStatus]);
}
