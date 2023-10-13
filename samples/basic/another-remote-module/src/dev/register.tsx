import type { ModuleRegisterFunction, Runtime } from "@squide/react-router";
import { DevHomePage } from "./DevHomePage.tsx";

export const registerDev: ModuleRegisterFunction<Runtime> = runtime => {
    runtime.registerRoute({
        index: true,
        element: <DevHomePage />
    });

    runtime.registerRoute({
        path: "/federated-tabs",
        lazy: () => import("@basic/shared/FederatedTabsLayout.tsx")
    });

    runtime.registerNavigationItem({
        $label: "Tabs",
        to: "/federated-tabs"
    });
};
