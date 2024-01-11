import { useToastListener } from "@basic/shared";
import { AppRouter as FireflyAppRouter } from "@squide/firefly";
import { useCallback } from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { AppRouterErrorBoundary } from "./AppRouterErrorBoundary.tsx";
import { ToastContainer, useToastContainer } from "./toast.tsx";

function Loading() {
    return (
        <div>Loading...</div>
    );
}

export function AppRouter() {
    const { toastState, addToast } = useToastContainer();

    const handleShowToast = useCallback((message: string) => {
        addToast(message);
    }, [addToast]);

    useToastListener(handleShowToast);

    return (
        <ToastContainer state={toastState}>
            <FireflyAppRouter
                fallbackElement={<Loading />}
                errorElement={<AppRouterErrorBoundary />}
                waitForMsw={false}
            >
                {(routes, providerProps) => (
                    <RouterProvider router={createBrowserRouter(routes)} {...providerProps} />
                )}
            </FireflyAppRouter>
        </ToastContainer>
    );
}
