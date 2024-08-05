import { updateLocalModuleDeferredRegistrations, type Runtime } from "@squide/core";
import { updateRemoteModuleDeferredRegistrations } from "./registerRemoteModules.ts";

export async function updateDeferredRegistrations<TData = unknown, TRuntime extends Runtime = Runtime>(data: TData, runtime: TRuntime) {
    runtime.startDeferredRegistrationScope(true);

    try {
        const localModuleErrors = await updateLocalModuleDeferredRegistrations(data, runtime);
        const remoteModuleErrors = await updateRemoteModuleDeferredRegistrations(data, runtime);

        return {
            localModuleErrors,
            remoteModuleErrors
        };
    } finally {
        runtime.completeDeferredRegistrationScope();
    }
}
