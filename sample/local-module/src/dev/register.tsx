import type { ModuleRegisterFunction, Runtime } from "@squide/react-router";
import { DevHome } from "./DevHome.tsx";

export const registerDev: ModuleRegisterFunction<Runtime> = runtime => {
    runtime.registerRoute({
        index: true,
        element: <DevHome />
    });

    runtime.registerRoute({
        path: "/federated-tabs",
        lazy: () => import("@sample/shared/FederatedTabsLayout.tsx")
    });

    runtime.registerNavigationItem({
        $label: "Tabs",
        to: "/federated-tabs"
    });
};
