import type { DeferredRegistrationData } from "@endpoints/shell";
import { getMswPlugin } from "@squide/msw";
import type { ModuleRegisterFunction, Runtime } from "@squide/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { ReactNode } from "react";

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

function Providers({ children }: { children: ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            {children}
            {process.env.ISOLATED && (
                <ReactQueryDevtools initialIsOpen={false} />
            )}
        </QueryClientProvider>
    );
}

const registerRoutes: ModuleRegisterFunction<Runtime, unknown, DeferredRegistrationData> = runtime => {
    runtime.registerRoute({
        $visibility: "public",
        path: "/public",
        lazy: () => import("./PublicPage.tsx")
    }, {
        hoist: true
    });

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
        path: "/federated-tabs",
        lazy: async () => {
            const { FederatedTabsLayout } = await import("@endpoints/shared/FederatedTabsLayout.tsx");

            return {
                element: <Providers><FederatedTabsLayout host="@endpoints/local-module" /></Providers>
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
        $label: "Subscription",
        to: "/subscription"
    });

    runtime.registerNavigationItem({
        $label: "Public page",
        to: "/public"
    });

    runtime.registerNavigationItem({
        $label: "Tabs",
        $priority: 100,
        to: "/federated-tabs"
    });

    runtime.registerNavigationItem({
        $label: "Characters",
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
                $label: "Feature A",
                to: "/feature-a"
            });
        }
    };
};

async function registerMsw(runtime: Runtime) {
    if (process.env.USE_MSW) {
        const mswPlugin = getMswPlugin(runtime);

        // Files including an import to the "msw" package are included dynamically to prevent adding
        // MSW stuff to the bundled when it's not used.
        const requestHandlers = (await import("../mocks/handlers.ts")).requestHandlers;

        mswPlugin.registerRequestHandlers(requestHandlers);
    }
}

export const registerLocalModule: ModuleRegisterFunction<Runtime, unknown, DeferredRegistrationData> = async runtime => {
    await registerMsw(runtime);

    return await registerRoutes(runtime);
};
