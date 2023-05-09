import { Route, useHoistedRoutes, useRoutes } from "@squide/react-router";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { useCallback, useMemo } from "react";

import { RootErrorBoundary } from "./RootErrorBoundary.tsx";
import { RootLayout } from "./RootLayout.tsx";

export function App() {
    const routes = useRoutes();

    const wrapManagedRoutes = useCallback((managedRoutes: Route[]) => {
        return {
            element: <RootLayout />,
            children: [
                {
                    // Pathless route to set an error boundary inside the layout instead of outside.
                    // It's quite useful to prevent losing the layout when an unmanaged error occurs.
                    errorElement: <RootErrorBoundary />,
                    children: [
                        {
                            path: "/",
                            element: (
                                <div>
                                    <h2>Home Page</h2>
                                    <p>Hey!</p>
                                </div>
                            )
                        },
                        ...managedRoutes
                    ]
                }
            ]
        };
    }, []);

    // Using the useHoistedRoutes hook allow routes hoisted by modules to be rendered at the root of the router instead of under the root layout.
    // To disallow the hoisting functionality, do not use this hook.
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
