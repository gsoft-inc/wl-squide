import type { ModuleRegisterFunction, Runtime } from "@squide/react-router";

export const register: ModuleRegisterFunction<Runtime> = runtime => {
    runtime.registerRoute({
        path: "/federated-tabs",
        lazy: () => import("@sample/shared/FederatedTabsLayout.tsx")
    });

    runtime.registerNavigationItem({
        to: "/federated-tabs",
        label: "Tabs"
    });
};
