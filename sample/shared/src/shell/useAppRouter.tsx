import { useHoistedRoutes, useRoutes, type Route } from "@squide/react-router";
import { lazy, useCallback, useMemo, useState } from "react";
import { AuthenticationBoundary } from "./AuthenticationBoundary.tsx";
import { RootErrorBoundary } from "./RootErrorBoundary.tsx";
import { RootLayout } from "./RootLayout.tsx";
// Importing the Router type to prevent: error TS2742: The inferred type of 'useAppRouter' cannot be named without a reference
import type { Router } from "@remix-run/router";
import { createBrowserRouter } from "react-router-dom";
import type { SessionManager } from "../session.ts";

export interface UseAppRouterOptions {
    managedRoutes?: Route[];
    rootRoutes?: Route[];
}

const AuthenticatedLayout = lazy(() => import("./AuthenticatedLayout.tsx"));
const ModuleErrorBoundary = lazy(() => import("./ModuleErrorBoundary.tsx"));
const Login = lazy(() => import("./Login.tsx"));
const Logout = lazy(() => import("./Logout.tsx"));
const NoMatch = lazy(() => import("./NoMatch.tsx"));

export function useAppRouter(sessionManager: SessionManager, options: UseAppRouterOptions = {}): Router {
    const {
        managedRoutes: hostManagedRoutes = [],
        rootRoutes = []
    } = options;

    // Reuse the same array reference through re-renders.
    const [memoizedManagedRoutes] = useState(hostManagedRoutes);
    const [memoizedRootRoutes] = useState(rootRoutes);

    const routes = useRoutes();

    const wrapManagedRoutes = useCallback((managedRoutes: Route[]) => {
        return {
            // Pathless route to declare a root layout and a root error boundary.
            element: <RootLayout />,
            children: [
                {
                    errorElement: <RootErrorBoundary />,
                    children: [
                        {
                            path: "/login",
                            element: <Login sessionManager={sessionManager} />
                        },
                        {
                            path: "/logout",
                            element: <Logout sessionManager={sessionManager} />
                        },
                        {
                            // Pathless route to declare an authenticated boundary.
                            element: <AuthenticationBoundary />,
                            children: [
                                {
                                    // Pathless route to declare an authenticated layout.
                                    element: <AuthenticatedLayout />,
                                    children: [
                                        {
                                            // Pathless route to declare an error boundary inside the layout instead of outside.
                                            // It's quite useful to prevent losing the layout when an unmanaged error occurs.
                                            errorElement: <ModuleErrorBoundary />,
                                            children: [
                                                ...memoizedManagedRoutes,
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
                }
            ]
        };
    }, []);

    // Using the useHoistedRoutes hook allow routes hoisted by modules to be rendered at the root of the router instead of under the root layout.
    // To disallow the hoisting functionality, remove this hook and add the routes directly.
    const hoistedRoutes = useHoistedRoutes(routes, wrapManagedRoutes);

    const router = useMemo(() => {
        return createBrowserRouter([...hoistedRoutes, ...memoizedRootRoutes]);
    }, [hoistedRoutes, memoizedRootRoutes]);

    return router;
}
