import type { SessionManager } from "@sample/shared";
import { getMswPlugin } from "@squide/msw";
import type { ModuleRegisterFunction, Runtime } from "@squide/react-router";
import { ManagedRoutes } from "@squide/react-router";
import { authenticationHandlers } from "../mocks/authenticationHandlers.ts";
import { RootErrorBoundary } from "./RootErrorBoundary.tsx";
import { RootLayout } from "./RootLayout.tsx";

// async function lazyPage(componentPath: string, props: object = {}) {
//     const { Component } = await import(`${componentPath}`);

//     return {
//         element: <Component {...props} />
//     };
// }

function registerRoutes(runtime: Runtime, sessionManager: SessionManager) {
    runtime.registerRoute({
        // Pathless route to declare a root layout and a root error boundary.
        visibility: "public",
        element: <RootLayout />,
        children: [
            {
                // Public pages like the login and logout pages will be rendered under this pathless route.
                visibility: "public",
                name: "root-error-boundary",
                errorElement: <RootErrorBoundary />,
                children: [
                    {
                        // Pathless route to declare an authenticated boundary.
                        // lazy: () => lazyElement("./AuthenticationBoundary.tsx"),
                        lazy: async () => {
                            const { AuthenticationBoundary } = await import("./AuthenticationBoundary.tsx");

                            return {
                                element: <AuthenticationBoundary />
                            };
                        },
                        children: [
                            {
                                // Pathless route to declare an authenticated layout.
                                // lazy: () => lazyPage("./AuthenticatedLayout.tsx", { sessionManager }),
                                lazy: async () => {
                                    const { AuthenticatedLayout } = await import("./AuthenticatedLayout.tsx");

                                    return {
                                        element: <AuthenticatedLayout sessionManager={sessionManager} />
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
            }
        ]
    }, {
        hoist: true
    });

    runtime.registerRoute({
        visibility: "public",
        path: "/login",
        lazy: async () => {
            const { Login } = await import("./Login.tsx");

            return {
                element: <Login />
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
                element: <Logout />
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
}

function registerMsw(runtime: Runtime) {
    const mswPlugin = getMswPlugin(runtime);

    mswPlugin.registerRequestHandlers(authenticationHandlers);
}

export function registerShell(sessionManager: SessionManager) {
    const register: ModuleRegisterFunction<Runtime> = runtime => {
        registerRoutes(runtime, sessionManager);
        registerMsw(runtime);
    };

    return register;
}
