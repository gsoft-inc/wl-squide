import type { ModuleRegisterFunction, Runtime } from "@squide/react-router";
import { ManagedRoutes } from "@squide/react-router";
import type { OnLoginHandler } from "./Login.tsx";
import type { onLogoutHandler } from "./Logout.tsx";
import { RootErrorBoundary } from "./RootErrorBoundary.tsx";
import { RootLayout } from "./RootLayout.tsx";

export function registerShell(onLogin: OnLoginHandler, onLogout: onLogoutHandler) {
    const register: ModuleRegisterFunction<Runtime> = runtime => {
        runtime.registerRoute({
            // Pathless route to declare a root layout and a root error boundary.
            hoist: true,
            element: <RootLayout />,
            children: [
                {
                    // Public pages like the login and logout pages will be rendered under this pathless route.
                    name: "root-error-boundary",
                    errorElement: <RootErrorBoundary />,
                    children: [
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
                                            errorElement: <ModuleErrorBoundary />
                                        };
                                    },
                                    children: [
                                        ManagedRoutes
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        });

        runtime.registerRoute({
            visibility: "public",
            path: "/login",
            lazy: async () => {
                const { Login } = await import("./Login.tsx");

                return {
                    element: <Login onLogin={onLogin} />
                };
            }
        }, {
            parentName: "root-error-boundary"
        });

        runtime.registerRoute({
            visibility: "public",
            path: "/logout",
            lazy: async () => {
                const { Logout } = await import("./Logout.tsx");

                return {
                    element: <Logout onLogout={onLogout} />
                };
            }
        }, {
            parentName: "root-error-boundary"
        });

        runtime.registerRoute({
            visibility: "public",
            path: "*",
            lazy: async () => {
                const { NoMatch } = await import("./NoMatch.tsx");

                return {
                    element: <NoMatch path={location.pathname} />
                };
            }
        }, {
            parentName: "root-error-boundary"
        });
    };

    return register;
}
