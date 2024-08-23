import { SessionManagerContext, useToastListener } from "@basic/shared";
import { AppRouter as FireflyAppRouter, useIsBootstrapping } from "@squide/firefly";
import { useCallback } from "react";
import { Outlet, RouterProvider, createBrowserRouter } from "react-router-dom";
import { Loading } from "./Loading.tsx";
import { RootErrorBoundary } from "./RootErrorBoundary.tsx";
import { ToastContainer, useToastContainer } from "./toast.tsx";
import { useSessionManagerInstance } from "./useSessionManagerInstance.ts";

function BootstrappingRoute() {
    const { toastState, addToast } = useToastContainer();

    const handleShowToast = useCallback((message: string) => {
        addToast(message);
    }, [addToast]);

    useToastListener(handleShowToast);

    const sessionManager = useSessionManagerInstance();

    if (useIsBootstrapping()) {
        return <Loading />;
    }

    return (
        <SessionManagerContext.Provider value={sessionManager}>
            <ToastContainer state={toastState}>
                <Outlet />
            </ToastContainer>
        </SessionManagerContext.Provider>
    );
}

export function AppRouter() {
    return (
        <FireflyAppRouter waitForMsw={false}>
            {({ rootRoute, registeredRoutes, routerProviderProps }) => {
                return (
                    <RouterProvider
                        router={createBrowserRouter([
                            {
                                element: rootRoute,
                                children: [
                                    {
                                        element: <BootstrappingRoute />,
                                        errorElement: <RootErrorBoundary />,
                                        children: registeredRoutes
                                    }
                                ]
                            }
                        ])}
                        {...routerProviderProps}
                    />
                );
            }}
        </FireflyAppRouter>
    );
}
