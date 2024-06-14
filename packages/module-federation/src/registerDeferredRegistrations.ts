import { registerLocalModuleDeferredRegistrations, type Runtime } from "@squide/core";
import { registerRemoteModuleDeferredRegistrations } from "./registerRemoteModules.ts";

export async function registerDeferredRegistrations<TRuntime extends Runtime = Runtime, TData = unknown>(runtime: TRuntime, data: TData) {
    runtime.startDeferredRegistrationScope();

    try {
        const localModuleErrors = await registerLocalModuleDeferredRegistrations(runtime, data);
        const remoteModuleErrors = await registerRemoteModuleDeferredRegistrations(runtime, data);

        return {
            localModuleErrors,
            remoteModuleErrors
        };
    } finally {
        runtime.completeDeferredRegistrationScope();
    }
}
