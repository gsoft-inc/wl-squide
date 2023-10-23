import type { FeatureFlags } from "@endpoints/shared";
import { getMswPlugin } from "@squide/msw";
import type { ModuleRegisterFunction, Runtime } from "@squide/react-router";
import { Providers } from "./Providers.tsx";

function registerRoutes(runtime: Runtime) {
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
        $label: "Episodes",
        to: "/federated-tabs/episodes"
    }, {
        menuId: "/federated-tabs"
    });

    runtime.registerNavigationItem({
        $label: "Locations",
        to: "/federated-tabs/locations"
    }, {
        menuId: "/federated-tabs"
    });

    runtime.registerNavigationItem({
        $label: "Failing",
        to: "/federated-tabs/failing"
    }, {
        menuId: "/federated-tabs"
    });

    return ({ featureFlags }: { featureFlags?: FeatureFlags } = {}) => {
        if (featureFlags?.featureB) {
            runtime.registerRoute({
                path: "/feature-b",
                lazy: () => import("./FeatureBPage.tsx")
            });

            runtime.registerNavigationItem({
                $label: "Feature B",
                to: "/feature-b"
            });
        }

        if (featureFlags?.featureC) {
            runtime.registerRoute({
                path: "/feature-c",
                lazy: () => import("./FeatureCPage.tsx")
            });

            runtime.registerNavigationItem({
                $label: "Feature C",
                to: "/feature-c"
            });
        }
    };
}

async function registerMsw(runtime: Runtime) {
    if (process.env.USE_MSW) {
        const mswPlugin = getMswPlugin(runtime);

        // Files including an import to the "msw" package are included dynamically to prevent adding
        // MSW stuff to the bundled when it's not used.
        const requestHandlers = (await import("../mocks/handlers.ts")).requestHandlers;

        mswPlugin.registerRequestHandlers(requestHandlers);
    }
}

export const register: ModuleRegisterFunction<Runtime> = async runtime => {
    await registerMsw(runtime);

    return registerRoutes(runtime);
};
