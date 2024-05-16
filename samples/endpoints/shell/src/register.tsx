import { registerLayouts } from "@endpoints/layouts";
import { ManagedRoutes, mergeDeferredRegistrations, type FireflyRuntime, type ModuleRegisterFunction } from "@squide/firefly";
import { RootLayout } from "./RootLayout.tsx";
import { initI18next } from "./i18next.ts";

export interface RegisterShellOptions {
    // This is only for demo purposed, do not copy this.
    host?: string;
}

function registerRoutes(runtime: FireflyRuntime, host?: string) {
    runtime.registerRoute({
        // Pathless route to declare a root layout and a root error boundary.
        $visibility: "public",
        $name: "root-layout",
        element: <RootLayout />,
        children: [
            {
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
    }, {
        hoist: true
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

async function registerMsw(runtime: FireflyRuntime) {
    if (runtime.isMswEnabled) {
        // Files including an import to the "msw" package are included dynamically to prevent adding
        // MSW stuff to the bundled when it's not used.
        const requestHandlers = (await import("../mocks/handlers.ts")).requestHandlers;

        runtime.registerRequestHandlers(requestHandlers);
    }
}

export function registerShell({ host }: RegisterShellOptions = {}) {
    const register: ModuleRegisterFunction<FireflyRuntime> = async runtime => {
        initI18next(runtime);

        await registerMsw(runtime);

        return mergeDeferredRegistrations([
            registerLayouts(runtime, { host }),
            registerRoutes(runtime, host)
        ]);
    };

    return register;
}
