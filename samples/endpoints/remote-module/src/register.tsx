import type { DeferredRegistrationData } from "@endpoints/shell";
import type { FireflyRuntime, ModuleRegisterFunction } from "@squide/firefly";
import { Providers } from "./Providers.tsx";
import i18n, { initI18n } from "./i18n.ts";

const registerRoutes: ModuleRegisterFunction<FireflyRuntime, unknown, DeferredRegistrationData> = runtime => {
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
        $label: i18n.t("navigationItems:episodesTab"),
        to: "/federated-tabs/episodes"
    }, {
        menuId: "/federated-tabs"
    });

    runtime.registerNavigationItem({
        $label: i18n.t("navigationItems:locationsTab"),
        to: "/federated-tabs/locations"
    }, {
        menuId: "/federated-tabs"
    });

    runtime.registerNavigationItem({
        $label: i18n.t("navigationItems:failingTab"),
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
                $label: i18n.t("navigationItems:featureBPage"),
                to: "/feature-b"
            });
        }

        if (featureFlags?.featureC) {
            runtime.registerRoute({
                path: "/feature-c",
                lazy: () => import("./FeatureCPage.tsx")
            });

            runtime.registerNavigationItem({
                $label: i18n.t("navigationItems:featureCPage"),
                to: "/feature-c"
            });
        }
    };
};

async function registerMsw(runtime: FireflyRuntime) {
    if (process.env.USE_MSW) {
        // Files including an import to the "msw" package are included dynamically to prevent adding
        // MSW stuff to the bundled when it's not used.
        const requestHandlers = (await import("../mocks/handlers.ts")).requestHandlers;

        runtime.registerRequestHandlers(requestHandlers);
    }
}

export const register: ModuleRegisterFunction<FireflyRuntime, unknown, DeferredRegistrationData> = async runtime => {
    await initI18n(runtime);
    await registerMsw(runtime);

    return registerRoutes(runtime);
};
