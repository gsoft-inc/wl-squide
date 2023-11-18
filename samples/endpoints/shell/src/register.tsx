import type { LanguageKey, SessionManager } from "@endpoints/shared";
import { ManagedRoutes, type FireflyRuntime, type ModuleRegisterFunction } from "@squide/firefly";
import { getI18nextPlugin, type i18nextPlugin } from "@squide/i18next";
import type { i18n } from "i18next";
import { I18nextProvider } from "react-i18next";
import { RootErrorBoundary } from "./RootErrorBoundary.tsx";
import { RootLayout } from "./RootLayout.tsx";
import { createI18nextInstance } from "./i18next.ts";

export interface RegisterShellOptions {
    // This is only for demo purposed, do not copy this.
    host?: string;
}

function registerRoutes(runtime: FireflyRuntime, i18nextInstance: i18n, sessionManager: SessionManager, host?: string) {
    runtime.registerRoute({
        // Pathless route to declare a root layout and a root error boundary.
        $visibility: "public",
        element: <I18nextProvider i18n={i18nextInstance}><RootLayout /></I18nextProvider>,
        children: [
            {
                // Public pages like the login and logout pages will be rendered under this pathless route.
                $visibility: "public",
                $name: "root-error-boundary",
                errorElement: <I18nextProvider i18n={i18nextInstance}><RootErrorBoundary /></I18nextProvider>,
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
                                        element: <I18nextProvider i18n={i18nextInstance}><AuthenticatedLayout sessionManager={sessionManager} /></I18nextProvider>
                                    };
                                },
                                children: [
                                    {
                                        // Pathless route to declare an error boundary inside the layout instead of outside.
                                        // It's quite useful to prevent losing the layout when an unmanaged error occurs.
                                        lazy: async () => {
                                            const { ModuleErrorBoundary } = await import("./ModuleErrorBoundary.tsx");

                                            return {
                                                errorElement: <I18nextProvider i18n={i18nextInstance}><ModuleErrorBoundary /></I18nextProvider>
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
        $visibility: "public",
        path: "/login",
        lazy: async () => {
            const { LoginPage } = await import("./LoginPage.tsx");

            return {
                element: <I18nextProvider i18n={i18nextInstance}><LoginPage host={host} /></I18nextProvider>
            };
        }
    }, {
        parentName: "root-error-boundary"
    });

    runtime.registerRoute({
        $visibility: "public",
        path: "/logout",
        lazy: async () => {
            const { LogoutPage } = await import("./LogoutPage.tsx");

            return {
                element: <I18nextProvider i18n={i18nextInstance}><LogoutPage host={host} /></I18nextProvider>
            };
        }
    }, {
        parentName: "root-error-boundary"
    });

    runtime.registerRoute({
        $visibility: "public",
        path: "*",
        lazy: async () => {
            const { NoMatchPage } = await import("./NoMatchPage.tsx");

            return {
                element: <I18nextProvider i18n={i18nextInstance}><NoMatchPage path={location.pathname} host={host} /></I18nextProvider>
            };
        }
    }, {
        parentName: "root-error-boundary"
    });
}

async function registerMsw(runtime: FireflyRuntime) {
    if (process.env.USE_MSW) {
        // Files including an import to the "msw" package are included dynamically to prevent adding
        // MSW stuff to the bundled when it's not used.
        const requestHandlers = (await import("../mocks/handlers.ts")).requestHandlers;

        runtime.registerRequestHandlers(requestHandlers);
    }
}

export function registerShell(sessionManager: SessionManager, { host }: RegisterShellOptions = {}) {
    const register: ModuleRegisterFunction<FireflyRuntime> = async runtime => {
        const plugin = getI18nextPlugin(runtime) as i18nextPlugin<LanguageKey>;
        const i18nextInstance = await createI18nextInstance(plugin.currentLanguage);

        plugin.registerInstance(i18nextInstance);

        await registerMsw(runtime);

        return registerRoutes(runtime, i18nextInstance, sessionManager, host);
    };

    return register;
}
