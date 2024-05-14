import { useEffect } from "react";
import { useAppRouterState } from "./AppRouterContext.ts";

export type CompleteRegistrationsCallback = () => void;

export function useCompleteDeferredRegistrationsCallback(callback: CompleteRegistrationsCallback) {
    const { canCompleteRegistrations } = useAppRouterState();

    useEffect(() => {
        if (canCompleteRegistrations) {
            callback();
        }
    }, [canCompleteRegistrations, callback]);
}
