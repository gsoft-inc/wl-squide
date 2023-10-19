import type { ModuleRegisterFunction, Runtime } from "@squide/react-router";
import { Providers } from "../Providers.tsx";
import { DevHomePage } from "./DevHomePage.tsx";

export const registerDev: ModuleRegisterFunction<Runtime> = runtime => {
    runtime.registerRoute({
        index: true,
        element: <DevHomePage />
    });

    runtime.registerRoute({
        path: "/federated-tabs",
        lazy: async () => {
            const { FederatedTabsLayout } = await import("@endpoints/shared/FederatedTabsLayout.tsx");

            return {
                element: <Providers><FederatedTabsLayout /></Providers>
            };
        }
    });

    runtime.registerNavigationItem({
        $label: "Tabs",
        to: "/federated-tabs"
    });
};
