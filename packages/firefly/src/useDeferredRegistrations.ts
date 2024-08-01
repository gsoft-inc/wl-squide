import { useRuntime, type ModuleRegistrationError } from "@squide/core";
import { useEffect } from "react";
import { useCanRegisterDeferredRegistrations } from "./useCanRegisterDeferredRegistrations.ts";
import { useCanUpdateDeferredRegistrations } from "./useCanUpdateDeferredRegistrations.ts";
import { useRegisterDeferredRegistrations } from "./useRegisterDeferredRegistrations.ts";
import { useUpdateDeferredRegistrations } from "./useUpdateDeferredRegistrations.ts";

export interface DeferredRegistrationsErrorsObject {
    localModuleErrors: ModuleRegistrationError[];
    remoteModuleErrors: ModuleRegistrationError[];
}

export type OnDeferredRegistrationsErrorCallback = (errorsObject: DeferredRegistrationsErrorsObject) => void;

export interface UseDeferredRegistrationsOptions {
    onError?: OnDeferredRegistrationsErrorCallback;
}

function hasError({ localModuleErrors, remoteModuleErrors }: DeferredRegistrationsErrorsObject) {
    return localModuleErrors.length > 0 || remoteModuleErrors.length > 0;
}

export function useDeferredRegistrations(data: unknown, { onError }: UseDeferredRegistrationsOptions = {}) {
    const runtime = useRuntime();

    const canRegisterDeferredRegistrations = useCanRegisterDeferredRegistrations();
    const canUpdateDeferredRegistrations = useCanUpdateDeferredRegistrations();

    const registerDeferredRegistrations = useRegisterDeferredRegistrations();
    const updateDeferredRegistrations = useUpdateDeferredRegistrations();

    useEffect(() => {
        if (canRegisterDeferredRegistrations) {
            const register = async () => {
                const errors = await registerDeferredRegistrations(runtime, data);

                if (hasError(errors) && onError) {
                    onError(errors);
                }
            };

            register();
        }
    }, [canRegisterDeferredRegistrations, registerDeferredRegistrations, data, onError, runtime]);

    useEffect(() => {
        if (canUpdateDeferredRegistrations) {
            const update = async () => {
                const errors = await updateDeferredRegistrations(runtime, data);

                if (hasError(errors) && onError) {
                    onError(errors);
                }
            };

            update();
        }
    }, [canUpdateDeferredRegistrations, updateDeferredRegistrations, data, onError, runtime]);
}
