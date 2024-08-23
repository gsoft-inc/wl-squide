import type { Runtime } from "@squide/core";
import { updateDeferredRegistrations } from "@squide/module-federation";
import { useCallback } from "react";
import { useAppRouterDispatcher } from "./AppRouterContext.ts";

export function useUpdateDeferredRegistrations() {
    const dispatch = useAppRouterDispatcher();

    return useCallback(async <TData = unknown, TRuntime extends Runtime = Runtime>(data: TData, runtime: TRuntime) => {
        const errors = await updateDeferredRegistrations(data, runtime);

        dispatch({ type: "deferred-registrations-updated" });

        return errors;
    }, [dispatch]);
}
