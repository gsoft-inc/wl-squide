import { useApplicationEventBusListener } from "@basic/shared";
import { AppRouter as FireflyAppRouter } from "@squide/firefly";
import { useCallback } from "react";
import { AppRouterErrorBoundary } from "./AppRouterErrorBoundary.tsx";
import { ToastContainer, useToastContainer } from "./toast.tsx";

function Loading() {
    return (
        <div>Loading...</div>
    );
}

export function AppRouter() {
    const { toastState, addToast } = useToastContainer();

    const handleShowToast = useCallback((message: unknown) => {
        addToast(message as string);
    }, [addToast]);

    useApplicationEventBusListener("show-toast", handleShowToast);

    return (
        <ToastContainer state={toastState}>
            <FireflyAppRouter
                fallbackElement={<Loading />}
                errorElement={<AppRouterErrorBoundary />}
                waitForMsw={false}
            />
        </ToastContainer>
    );
}
