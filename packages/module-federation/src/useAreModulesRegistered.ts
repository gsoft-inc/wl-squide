import { addLocalModuleRegistrationStatusChangedListener, getLocalModuleRegistrationStatus, removeLocalModuleRegistrationStatusChangedListener, type ModuleRegistrationStatus } from "@squide/core";
import { useMemo, useSyncExternalStore } from "react";
import { addRemoteModuleRegistrationStatusChangedListener, getRemoteModuleRegistrationStatus, removeRemoteModuleRegistrationStatusChangedListener } from "./registerRemoteModules.ts";

export function areModulesRegistered(localModuleRegistrationStatus: ModuleRegistrationStatus, remoteModuleRegistrationStatus: ModuleRegistrationStatus) {
    if (localModuleRegistrationStatus === "none" && remoteModuleRegistrationStatus === "none") {
        return false;
    }

    // The registration for local or remote modules could be "none" if an application doesn't register either local or remote modules.
    // The registration for local or remote modules could be "registering-deferred-registration" if all the modules of an application are registered and it's registering the deferred registrations (which is considered as being already registered).
    // The registration statuses could be at "ready" if there's no deferred registrations.
    return (localModuleRegistrationStatus === "none" || localModuleRegistrationStatus === "modules-registered" || localModuleRegistrationStatus === "registering-deferred-registration" || localModuleRegistrationStatus === "ready") &&
    //    (remoteModuleRegistrationStatus === "none" || remoteModuleRegistrationStatus === "modules-registered" || localModuleRegistrationStatus === "registering-deferred-registration" || remoteModuleRegistrationStatus === "ready");
           (remoteModuleRegistrationStatus === "none" || remoteModuleRegistrationStatus === "modules-registered" || remoteModuleRegistrationStatus === "registering-deferred-registration" || remoteModuleRegistrationStatus === "ready");
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
