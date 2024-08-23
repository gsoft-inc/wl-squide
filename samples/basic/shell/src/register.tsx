import { ManagedRoutes, type FireflyRuntime, type ModuleRegisterFunction } from "@squide/firefly";
import { RootLayout } from "./RootLayout.tsx";

export interface RegisterShellOptions {
    // This is only for demo purposed, do not copy this.
    host?: string;
}

function registerRoutes(runtime: FireflyRuntime, host?: string) {
    runtime.registerRoute({
        // Pathless route to declare a root layout and a root error boundary.
        $visibility: "public",
        $name: "root-layout",
        element: <RootLayout />
    }, {
        hoist: true
    });

    runtime.registerRoute({
        // Pathless route to declare an authenticated boundary.
        lazy: () => import("./AuthenticationBoundary.tsx"),
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
                        lazy: () => import("./ModuleErrorBoundary.tsx"),
                        children: [
                            ManagedRoutes
                        ]
                    }
                ]
            }
        ]
    }, {
        parentName: "root-layout"
    });

    runtime.registerRoute({
        $visibility: "public",
        path: "/login",
        lazy: async () => {
            const { LoginPage } = await import("./LoginPage.tsx");

            return {
                element: <LoginPage host={host} />
            };
        }
    }, {
        parentName: "root-layout"
    });

    runtime.registerRoute({
        $visibility: "public",
        path: "/logout",
        lazy: async () => {
            const { LogoutPage } = await import("./LogoutPage.tsx");

            return {
                element: <LogoutPage host={host} />
            };
        }
    }, {
        parentName: "root-layout"
    });

    runtime.registerRoute({
        $visibility: "public",
        path: "*",
        lazy: async () => {
            const { NoMatchPage } = await import("./NoMatchPage.tsx");

            return {
                element: <NoMatchPage path={location.pathname} host={host} />
            };
        }
    }, {
        parentName: "root-layout"
    });
}

export function registerShell({ host }: RegisterShellOptions = {}) {
    const register: ModuleRegisterFunction<FireflyRuntime> = runtime => {
        return registerRoutes(runtime, host);
    };

    return register;
}
