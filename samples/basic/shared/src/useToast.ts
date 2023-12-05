import { useCallback } from "react";
import { useApplicationEventBusDispatcher } from "./eventBus.ts";

export function useToast() {
    const dispatch = useApplicationEventBusDispatcher();

    return useCallback((message: string) => {
        dispatch("show-toast", message);
    }, [dispatch]);
}
