import type { ModuleRegisterFunction, Runtime } from "@squide/react-router";

export const register: ModuleRegisterFunction<Runtime> = runtime => {
    runtime.registerRoutes([
        {
            path: "/federated-tabs",
            lazy: () => import("@sample/shared/FederatedTabsLayout.tsx")
        }
    ]);

    runtime.registerNavigationItems([
        {
            to: "/federated-tabs",
            label: "Tabs"
        }
    ]);
};
