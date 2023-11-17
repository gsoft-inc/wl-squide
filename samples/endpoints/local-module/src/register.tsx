import type { LanguageKey } from "@endpoints/shared";
import type { DeferredRegistrationData } from "@endpoints/shell";
import type { DeferredRegistrationFunction, FireflyRuntime, ModuleRegisterFunction } from "@squide/firefly";
import { I18nextNavigationLabel, getI18nextPlugin, type i18nextPlugin } from "@squide/i18next";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { i18n } from "i18next";
import type { ReactNode } from "react";
import { I18nextProvider } from "react-i18next";
import { createI18nextInstance } from "./i18next.ts";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: failureCount => {
                return failureCount <= 2;
            }
        }
    }
});

interface ProvidersProps {
    i18nextInstance: i18n;
    children: ReactNode;
}

function Providers({ i18nextInstance, children }: ProvidersProps) {
    return (
        <QueryClientProvider client={queryClient}>
            <I18nextProvider i18n={i18nextInstance}>
                {children}
            </I18nextProvider>
            {process.env.ISOLATED && (
                <ReactQueryDevtools initialIsOpen={false} />
            )}
        </QueryClientProvider>
    );
}

function registerRoutes(runtime: FireflyRuntime, i18nextInstance: i18n): DeferredRegistrationFunction<DeferredRegistrationData> {
    runtime.registerRoute({
        $visibility: "public",
        path: "/public",
        lazy: async () => {
            const { PublicPage } = await import("./PublicPage.tsx");

            return {
                element: <Providers i18nextInstance={i18nextInstance}><PublicPage /></Providers>
            };
        }
    }, {
        hoist: true
    });

    runtime.registerRoute({
        path: "/subscription",
        lazy: async () => {
            const { SubscriptionPage } = await import("./SubscriptionPage.tsx");

            return {
                element: <Providers i18nextInstance={i18nextInstance}><SubscriptionPage /></Providers>
            };
        }
    });

    runtime.registerRoute({
        index: true,
        lazy: async () => {
            const { CharactersTab } = await import("./CharactersTab.tsx");

            return {
                element: <Providers i18nextInstance={i18nextInstance}><CharactersTab /></Providers>
            };
        }
    }, {
        parentPath: "/federated-tabs"
    });

    runtime.registerNavigationItem({
        $label: <I18nextNavigationLabel i18nextInstance={i18nextInstance} resourceKey="navigationItems:subscriptionPage" />,
        to: "/subscription"
    });

    runtime.registerNavigationItem({
        $label: <I18nextNavigationLabel i18nextInstance={i18nextInstance} resourceKey="navigationItems:publicPage" />,
        to: "/public"
    });

    runtime.registerNavigationItem({
        $label: <I18nextNavigationLabel i18nextInstance={i18nextInstance} resourceKey="navigationItems:charactersTab" />,
        to: "/federated-tabs"
    }, {
        menuId: "/federated-tabs"
    });

    return ({ featureFlags } = {}) => {
        if (featureFlags?.featureA) {
            runtime.registerRoute({
                path: "/feature-a",
                lazy: () => import("./FeatureAPage.tsx")
            });

            runtime.registerNavigationItem({
                $label: <I18nextNavigationLabel i18nextInstance={i18nextInstance} resourceKey="navigationItems:featureAPage" />,
                to: "/feature-a"
            });
        }
    };
}

async function registerMsw(runtime: FireflyRuntime) {
    if (process.env.USE_MSW) {
        // Files including an import to the "msw" package are included dynamically to prevent adding
        // MSW stuff to the bundled when it's not used.
        const requestHandlers = (await import("../mocks/handlers.ts")).requestHandlers;

        runtime.registerRequestHandlers(requestHandlers);
    }
}

export const registerLocalModule: ModuleRegisterFunction<FireflyRuntime, unknown, DeferredRegistrationData> = async runtime => {
    const plugin = getI18nextPlugin(runtime) as i18nextPlugin<LanguageKey>;
    const i18nextInstance = await createI18nextInstance(plugin.currentLanguage);

    plugin.registerInstance(i18nextInstance);

    await registerMsw(runtime);

    return registerRoutes(runtime, i18nextInstance);
};
