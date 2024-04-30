import type { DeferredRegistrationData } from "@endpoints/shared";
import type { DeferredRegistrationFunction, FireflyRuntime, ModuleRegisterFunction } from "@squide/firefly";
import { I18nextNavigationItemLabel } from "@squide/i18next";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { i18n } from "i18next";
import type { ReactNode } from "react";
import { initI18next } from "./i18next.ts";

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
    children: ReactNode;
}

function Providers({ children }: ProvidersProps) {
    return (
        <QueryClientProvider client={queryClient}>
            {children}
            {process.env.ISOLATED && (
                <ReactQueryDevtools initialIsOpen={false} />
            )}
        </QueryClientProvider>
    );
}

function registerRoutes(runtime: FireflyRuntime, i18nextInstance: i18n): DeferredRegistrationFunction<DeferredRegistrationData> {
    runtime.registerRoute({
        path: "/subscription",
        lazy: async () => {
            const { SubscriptionPage } = await import("./SubscriptionPage.tsx");

            return {
                element: <Providers><SubscriptionPage /></Providers>
            };
        }
    });

    runtime.registerRoute({
        index: true,
        lazy: async () => {
            const { CharactersTab } = await import("./CharactersTab.tsx");

            return {
                element: <Providers><CharactersTab /></Providers>
            };
        }
    }, {
        parentPath: "/federated-tabs"
    });

    runtime.registerNavigationItem({
        $label: <I18nextNavigationItemLabel i18next={i18nextInstance} resourceKey="subscriptionPage" />,
        to: "/subscription"
    });

    runtime.registerNavigationItem({
        $label: <I18nextNavigationItemLabel i18next={i18nextInstance} resourceKey="charactersTab" />,
        to: "/federated-tabs"
    }, {
        menuId: "/federated-tabs"
    });

    return ({ featureFlags } = {}) => {
        if (!runtime.getSession()) {
            throw new Error("The deferred registrations are broken as they are executed before the protected data has been loaded.");
        }

        if (featureFlags?.featureA) {
            runtime.registerRoute({
                path: "/feature-a",
                lazy: () => import("./FeatureAPage.tsx")
            });

            runtime.registerNavigationItem({
                $label: <I18nextNavigationItemLabel i18next={i18nextInstance} resourceKey="featureAPage" />,
                to: "/feature-a"
            });
        }
    };
}

async function registerMsw(runtime: FireflyRuntime) {
    if (runtime.isMswEnabled) {
        // Files including an import to the "msw" package are included dynamically to prevent adding
        // MSW stuff to the bundled when it's not used.
        const requestHandlers = (await import("../mocks/handlers.ts")).requestHandlers;

        runtime.registerRequestHandlers(requestHandlers);
    }
}

export const registerLocalModule: ModuleRegisterFunction<FireflyRuntime, unknown, DeferredRegistrationData> = async runtime => {
    const i18nextInstance = initI18next(runtime);

    await registerMsw(runtime);

    return registerRoutes(runtime, i18nextInstance);
};
