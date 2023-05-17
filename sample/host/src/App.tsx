import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { lazy, useCallback, useMemo } from "react";
import { useHoistedRoutes, useRoutes, type Route } from "@squide/react-router";

import { AuthenticationBoundary } from "./AuthenticationBoundary.tsx";
import { RootErrorBoundary } from "./RootErrorBoundary.tsx";
import { RootLayout } from "./RootLayout.tsx";
import { useAreRemotesReady } from "@squide/webpack-module-federation";

const AuthenticatedLayout = lazy(() => import("./AuthenticatedLayout.tsx"));
const ModuleErrorBoundary = lazy(() => import("./ModuleErrorBoundary.tsx"));
const Home = lazy(() => import("./Home.tsx"));
const Login = lazy(() => import("./Login.tsx"));
const NoMatch = lazy(() => import("./NoMatch.tsx"));

export function App() {
    // Re-render the app once all the remotes are registered.
    // Otherwise, the remotes routes won't be added to the router.
    const isReady = useAreRemotesReady();

    const routes = useRoutes();

    const wrapManagedRoutes = useCallback((managedRoutes: Route[]) => {
        return {
            // Pathless route to set a root layout and a root error boundary.
            element: <RootLayout />,
            errorElement: <RootErrorBoundary />,
            children: [
                {
                    path: "/login",
                    element: <Login />
                },
                {
                    // Pathless route to set an authenticated boundary.
                    element: <AuthenticationBoundary />,
                    children: [
                        {
                            // Pathless route to set an authenticated layout.
                            element: <AuthenticatedLayout />,
                            children: [
                                {
                                    // Pathless route to set an error boundary inside the layout instead of outside.
                                    // It's quite useful to prevent losing the layout when an unmanaged error occurs.
                                    errorElement: <ModuleErrorBoundary />,
                                    children: [
                                        {
                                            index: true,
                                            element: <Home />
                                        },
                                        ...managedRoutes
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    path: "*",
                    element: <NoMatch path={location.pathname} />
                }
            ]
        };
    }, []);

    // Using the useHoistedRoutes hook allow routes hoisted by modules to be rendered at the root of the router instead of under the root layout.
    // To disallow the hoisting functionality, remove this hook and add the routes directly.
    const hoistedRoutes = useHoistedRoutes(routes, wrapManagedRoutes);

    const router = useMemo(() => {
        return createBrowserRouter(hoistedRoutes);
    }, [hoistedRoutes]);

    if (!isReady) {
        return <div>Loading...</div>;
    }

    return (
        <RouterProvider
            router={router}
            fallbackElement={<div>Loading...</div>}
        />
    );
}
