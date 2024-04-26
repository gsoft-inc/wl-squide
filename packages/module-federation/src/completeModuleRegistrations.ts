import { completeLocalModuleRegistrations, getLocalModuleRegistrationStatus, type LocalModuleRegistrationError, type Runtime } from "@squide/core";
import { completeRemoteModuleRegistrations, getRemoteModuleRegistrationStatus, type RemoteModuleRegistrationError } from "./registerRemoteModules.ts";

export async function completeModuleRegistrations<TRuntime extends Runtime = Runtime, TData = unknown>(runtime: TRuntime, data?: TData) {
    const promise: Promise<unknown>[] = [];

    if (getLocalModuleRegistrationStatus() !== "none") {
        promise.push(completeLocalModuleRegistrations(runtime, data));
    }

    if (getRemoteModuleRegistrationStatus() !== "none") {
        promise.push(completeRemoteModuleRegistrations(runtime, data));
    }

    const [localModuleErrors, remoteModuleErrors] = await Promise.allSettled(promise);

    return {
        localModuleErrors: localModuleErrors as unknown as LocalModuleRegistrationError,
        remoteModuleErrors: remoteModuleErrors as unknown as RemoteModuleRegistrationError
    };
}
