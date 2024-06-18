import { useRuntime } from "@squide/core";
import { useEffect } from "react";
import { useCanRegisterDeferredRegistrations } from "./useCanRegisterDeferredRegistrations.ts";
import { useCanUpdateDeferredRegistrations } from "./useCanUpdateDeferredRegistrations.ts";
import { useRegisterDeferredRegistrations } from "./useRegisterDeferredRegistrations.ts";
import { useUpdateDeferredRegistrations } from "./useUpdateDeferredRegistrations.ts";

export function useDeferredRegistrations(data: unknown) {
    const runtime = useRuntime();

    const canRegisterDeferredRegistrations = useCanRegisterDeferredRegistrations();
    const canUpdateDeferredRegistrations = useCanUpdateDeferredRegistrations();

    const registerDeferredRegistrations = useRegisterDeferredRegistrations();
    const updateDeferredRegistrations = useUpdateDeferredRegistrations();

    useEffect(() => {
        if (canRegisterDeferredRegistrations) {
            registerDeferredRegistrations(runtime, data);
        }
    }, [canRegisterDeferredRegistrations, registerDeferredRegistrations, data, runtime]);

    useEffect(() => {
        if (canUpdateDeferredRegistrations) {
            updateDeferredRegistrations(runtime, data);
        }
    }, [canUpdateDeferredRegistrations, updateDeferredRegistrations, data, runtime]);
}
