import { completeLocalModuleRegistrations, type AbstractRuntime, type LocalModuleRegistrationError } from "@squide/core";
import { completeRemoteModuleRegistrations, type RemoteModuleRegistrationError } from "./registerRemoteModules.ts";

export function completeModuleRegistrations<TRuntime extends AbstractRuntime = AbstractRuntime, TData = unknown>(runtime: TRuntime, data?: TData) {
    const promise: Promise<unknown>[] = [
        completeLocalModuleRegistrations(runtime, data),
        completeRemoteModuleRegistrations(runtime, data)
    ];

    return Promise.allSettled(promise).then(([locaModuleErrors, remoteModuleErrors]) => {
        return {
            locaModuleErrors: locaModuleErrors as unknown as LocalModuleRegistrationError,
            remoteModuleErrors: remoteModuleErrors as unknown as RemoteModuleRegistrationError
        };
    });
}
