import { updateLocalModuleDeferredRegistrations, type Runtime } from "@squide/core";
import { updateRemoteModuleDeferredRegistrations } from "./registerRemoteModules.ts";

export async function updateDeferredRegistrations<TRuntime extends Runtime = Runtime, TData = unknown>(runtime: TRuntime, data: TData) {
    runtime.startDeferredRegistrationScope(true);

    try {
        const localModuleErrors = await updateLocalModuleDeferredRegistrations(runtime, data);
        const remoteModuleErrors = await updateRemoteModuleDeferredRegistrations(runtime, data);

        return {
            localModuleErrors,
            remoteModuleErrors
        };
    } finally {
        runtime.completeDeferredRegistrationScope();
    }
}
