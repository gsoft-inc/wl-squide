import { completeLocalModuleRegistration, type LocalModuleRegistrationError, type Logger } from "@squide/core";
import { completeRemoteModuleRegistration, type RemoteModuleRegistrationError } from "./registerRemoteModules.ts";

export function completeModuleRegistration<TData = unknown>(logger: Logger, data?: TData) {
    const promise: Promise<unknown>[] = [
        completeLocalModuleRegistration(logger, data),
        completeRemoteModuleRegistration(logger, data)
    ];

    return Promise.allSettled(promise).then(([locaModulesErrors, remoteModulesErrors]) => {
        return {
            locaModulesErrors: locaModulesErrors as unknown as LocalModuleRegistrationError,
            remoteModulesErrors: remoteModulesErrors as unknown as RemoteModuleRegistrationError
        };
    });
}
