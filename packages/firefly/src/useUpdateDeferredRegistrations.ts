import type { Runtime } from "@squide/core";
import { updateDeferredRegistrations } from "@squide/module-federation";
import { useCallback } from "react";
import { useAppRouterDispatcher } from "./AppRouterContext.ts";

export function useUpdateDeferredRegistrations() {
    const dispatch = useAppRouterDispatcher();

    return useCallback(async <TRuntime extends Runtime = Runtime, TData = unknown>(runtime: TRuntime, data?: TData) => {
        const errors = await updateDeferredRegistrations(runtime, data);

        dispatch({ type: "deferred-registrations-updated" });

        return errors;
    }, [dispatch]);
}
