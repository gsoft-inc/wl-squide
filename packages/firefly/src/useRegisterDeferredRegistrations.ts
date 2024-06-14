import type { Runtime } from "@squide/core";
import { registerDeferredRegistrations } from "@squide/module-federation";
import { useCallback } from "react";

export function useRegisterDeferredRegistrations() {
    return useCallback(<TRuntime extends Runtime = Runtime, TData = unknown>(runtime: TRuntime, data?: TData) => {
        return registerDeferredRegistrations(runtime, data);
    }, []);
}
