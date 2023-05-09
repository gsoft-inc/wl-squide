import { Route, useHoistedRoutes, useRoutes } from "@squide/react-router";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { lazy, useCallback, useMemo } from "react";

import { AuthenticationBoundary } from "./AuthenticationBoundary.tsx";
import { RootErrorBoundary } from "./RootErrorBoundary.tsx";
import { RootLayout } from "./RootLayout.tsx";

const AuthenticatedLayout = lazy(() => import("./AuthenticatedLayout.tsx"));

const Home = lazy(() => import("./Home.tsx"));
const Login = lazy(() => import("./Login.tsx"));

export function App() {
    const routes = useRoutes();

    const wrapManagedRoutes = useCallback((managedRoutes: Route[]) => {
        return {
            element: <RootLayout />,
            children: [
                {
                    path: "/login",
                    element: <Login />
                },
                {
                    // Pathless route to set an authenticated boundary at the root of the application.
                    element: <AuthenticationBoundary />,
                    children: [
                        {
                            element: <AuthenticatedLayout />,
                            children: [
                                {
                                    // Pathless route to set an error boundary inside the layout instead of outside.
                                    // It's quite useful to prevent losing the layout when an unmanaged error occurs.
                                    errorElement: <RootErrorBoundary />,
                                    children: [
                                        {
                                            path: "/",
                                            element: <Home />
                                        },
                                        ...managedRoutes
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        };
    }, []);

    // Using the useHoistedRoutes hook allow routes hoisted by modules to be rendered at the root of the router instead of under the root layout.
    // To disallow the hoisting functionality, remove this hook and add the routes directly.
    const hoistedRoutes = useHoistedRoutes(routes, {
        wrapManagedRoutes
    });

    const router = useMemo(() => {
        return createBrowserRouter(hoistedRoutes);
    }, [hoistedRoutes]);

    return (
        <RouterProvider
            router={router}
            fallbackElement="Loading..."
        />
    );
}
