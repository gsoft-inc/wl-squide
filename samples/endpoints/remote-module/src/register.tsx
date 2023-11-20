import type { DeferredRegistrationData } from "@endpoints/shell";
import type { DeferredRegistrationFunction, FireflyRuntime, ModuleRegisterFunction } from "@squide/firefly";
import { I18nextNavigationLabel } from "@squide/i18next";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { i18n } from "i18next";
import type { ReactNode } from "react";
import { initI18next } from "./i18next.ts";

export const queryClient = new QueryClient({
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
        $visibility: "public",
        path: "/anonymous",
        lazy: async () => {
            const { AnonymousPage } = await import("./AnonymousPage.tsx");

            return {
                element: <Providers><AnonymousPage /></Providers>
            };
        }
    }, {
        parentName: "root-error-boundary"
    });

    runtime.registerRoute({
        path: "/federated-tabs/episodes",
        lazy: async () => {
            const { EpisodesTab } = await import("./EpisodesTab.tsx");

            return {
                element: <Providers><EpisodesTab /></Providers>
            };
        }
    }, {
        parentPath: "/federated-tabs"
    });

    runtime.registerRoute({
        path: "/federated-tabs/locations",
        lazy: async () => {
            const { LocationsTab } = await import("./LocationsTab.tsx");

            return {
                element: <Providers><LocationsTab /></Providers>
            };
        }
    }, {
        parentPath: "/federated-tabs"
    });

    runtime.registerRoute({
        path: "/federated-tabs/failing",
        lazy: async () => {
            const { FailingTab } = await import("./FailingTab.tsx");

            return {
                element: <Providers><FailingTab /></Providers>
            };
        }
    }, {
        parentPath: "/federated-tabs"
    });

    runtime.registerNavigationItem({
        $label: <I18nextNavigationLabel i18next={i18nextInstance} resourceKey="episodesTab" />,
        to: "/federated-tabs/episodes"
    }, {
        menuId: "/federated-tabs"
    });

    runtime.registerNavigationItem({
        $label: <I18nextNavigationLabel i18next={i18nextInstance} resourceKey="locationsTab" />,
        to: "/federated-tabs/locations"
    }, {
        menuId: "/federated-tabs"
    });

    runtime.registerNavigationItem({
        $label: <I18nextNavigationLabel i18next={i18nextInstance} resourceKey="failingTab" />,
        to: "/federated-tabs/failing"
    }, {
        menuId: "/federated-tabs"
    });

    return ({ featureFlags } = {}) => {
        if (featureFlags?.featureB) {
            runtime.registerRoute({
                path: "/feature-b",
                lazy: () => import("./FeatureBPage.tsx")
            });

            runtime.registerNavigationItem({
                $label: <I18nextNavigationLabel i18next={i18nextInstance} resourceKey="featureBPage" />,
                to: "/feature-b"
            });
        }

        if (featureFlags?.featureC) {
            runtime.registerRoute({
                path: "/feature-c",
                lazy: () => import("./FeatureCPage.tsx")
            });

            runtime.registerNavigationItem({
                $label: <I18nextNavigationLabel i18next={i18nextInstance} resourceKey="featureCPage" />,
                to: "/feature-c"
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

export const register: ModuleRegisterFunction<FireflyRuntime, unknown, DeferredRegistrationData> = async runtime => {
    const i18nextInstance = await initI18next(runtime);

    await registerMsw(runtime);

    return registerRoutes(runtime, i18nextInstance);
};
