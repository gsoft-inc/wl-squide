import type { Runtime } from "@squide/core";
import { registerDeferredRegistrations } from "@squide/module-federation";
import { useCallback } from "react";

export function useRegisterDeferredRegistrations() {
    return useCallback(<TData = unknown, TRuntime extends Runtime = Runtime>(data: TData, runtime: TRuntime) => {
        return registerDeferredRegistrations(data, runtime);
    }, []);
}
