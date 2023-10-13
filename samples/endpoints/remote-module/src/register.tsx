import { getMswPlugin } from "@squide/msw";
import type { ModuleRegisterFunction, Runtime } from "@squide/react-router";
import { episodeHandlers } from "../mocks/episodeHandlers.ts";
import { locationHandlers } from "../mocks/locationHandlers.ts";
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
}

function registerMsw(runtime: Runtime) {
    const mswPlugin = getMswPlugin(runtime);

    mswPlugin.registerRequestHandlers([
        ...episodeHandlers,
        ...locationHandlers
    ]);
}

export const register: ModuleRegisterFunction<Runtime> = runtime => {
    registerRoutes(runtime);
    registerMsw(runtime);
};
