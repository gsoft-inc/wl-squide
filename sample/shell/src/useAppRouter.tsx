import { useHoistedRoutes, useRoutes, useRuntime, type Route } from "@squide/react-router";
import { useCallback, useMemo, useState } from "react";
import { RootErrorBoundary } from "./RootErrorBoundary.tsx";
import { RootLayout } from "./RootLayout.tsx";
// Importing the Router type to prevent: error TS2742: The inferred type of 'useAppRouter' cannot be named without a reference
import type { Router } from "@remix-run/router";
import { createBrowserRouter } from "react-router-dom";
import type { OnLoginHandler } from "./Login.tsx";
import type { onLogoutHandler } from "./Logout.tsx";

export interface UseAppRouterOptions {
    managedRoutes?: Route[];
    rootRoutes?: Route[];
}

export function useAppRouter(onLogin: OnLoginHandler, onLogout: onLogoutHandler, options: UseAppRouterOptions = {}): Router {
    const {
        managedRoutes: hostManagedRoutes = [],
        rootRoutes = []
    } = options;

    // Reuse the same array reference through re-renders.
    const [memoizedManagedRoutes] = useState(hostManagedRoutes);
    const [memoizedRootRoutes] = useState(rootRoutes);

    const runtime = useRuntime();
    const routes = useRoutes();

    // All routes must be registered in order to retrieve the active route
    // visibility property.
    runtime.registerRoutes([
        {
            // Pathless route to declare a root layout and a root error boundary.
            hoist: true,
            public: true,
            element: <RootLayout />,
            children: [
                {
                    errorElement: <RootErrorBoundary />,
                    children: [
                        {
                            path: "/login",
                            lazy: async () => {
                                const { Login } = await import("./Login.tsx");

                                return {
                                    element: <Login onLogin={onLogin} />
                                };
                            }
                        },
                        {
                            path: "/logout",
                            lazy: async () => {
                                const { Logout } = await import("./Logout.tsx");

                                return {
                                    element: <Logout onLogout={onLogout} />
                                };
                            }
                        },
                        {
                            path: "*",
                            lazy: async () => {
                                const { NoMatch } = await import("./NoMatch.tsx");

                                return {
                                    element: <NoMatch path={location.pathname} />
                                };
                            }
                        }
                    ]
                }
            ]
        }
    ]);

    const wrapManagedRoutes = useCallback((managedRoutes: Route[]) => {
        return {
            // Pathless route to declare a root layout and a root error boundary.
            element: <RootLayout />,
            children: [
                {
                    errorElement: <RootErrorBoundary />,
                    children: [
                        // {
                        //     path: "/login",
                        //     lazy: async () => {
                        //         const { Login } = await import("./Login.tsx");

                        //         return {
                        //             element: <Login onLogin={onLogin} />
                        //         };
                        //     }
                        // },
                        // {
                        //     path: "/logout",
                        //     lazy: async () => {
                        //         const { Logout } = await import("./Logout.tsx");

                        //         return {
                        //             element: <Logout onLogout={onLogout} />
                        //         };
                        //     }
                        // },
                        {
                            // Pathless route to declare an authenticated layout.
                            lazy: async () => {
                                const { AuthenticatedLayout } = await import("./AuthenticatedLayout.tsx");

                                return {
                                    element: <AuthenticatedLayout />
                                };
                            },
                            children: [
                                {
                                    // Pathless route to declare an error boundary inside the layout instead of outside.
                                    // It's quite useful to prevent losing the layout when an unmanaged error occurs.
                                    lazy: async () => {
                                        const { ModuleErrorBoundary } = await import("./ModuleErrorBoundary.tsx");

                                        return {
                                            element: <ModuleErrorBoundary />
                                        };
                                    },
                                    children: [
                                        ...memoizedManagedRoutes,
                                        ...managedRoutes
                                    ]
                                }
                            ]
                        }
                        // {
                        //     // Pathless route to declare an authenticated boundary.
                        //     lazy: () => import("./AuthenticationBoundary.tsx"),
                        //     children: [
                        //         {
                        //             // Pathless route to declare an authenticated layout.
                        //             lazy: () => import("./AuthenticatedLayout.tsx"),
                        //             children: [
                        //                 {
                        //                     // Pathless route to declare an error boundary inside the layout instead of outside.
                        //                     // It's quite useful to prevent losing the layout when an unmanaged error occurs.
                        //                     lazy: () => import("./ModuleErrorBoundary.tsx"),
                        //                     children: [
                        //                         ...memoizedManagedRoutes,
                        //                         ...managedRoutes
                        //                     ]
                        //                 }
                        //             ]
                        //         }
                        //     ]
                        // },
                        // {
                        //     path: "*",
                        //     lazy: async () => {
                        //         const { NoMatch } = await import("./NoMatch.tsx");

                        //         return {
                        //             element: <NoMatch path={location.pathname} />
                        //         };
                        //     }
                        // }
                    ]
                }
            ]
        };
    }, [memoizedManagedRoutes]);
    // }, [memoizedManagedRoutes, onLogin, onLogout]);

    // Using the useHoistedRoutes hook allow routes hoisted by modules to be rendered at the root of the router instead of under the root layout.
    // To disallow the hoisting functionality, remove this hook and add the routes directly.
    const hoistedRoutes = useHoistedRoutes(routes, wrapManagedRoutes);

    const router = useMemo(() => {
        return createBrowserRouter([...hoistedRoutes, ...memoizedRootRoutes]);
    }, [hoistedRoutes, memoizedRootRoutes]);

    return router;
}
