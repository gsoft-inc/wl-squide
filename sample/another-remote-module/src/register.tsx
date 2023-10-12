import type { ModuleRegisterFunction, Runtime } from "@squide/react-router";

function registerRoutes(runtime: Runtime) {
    runtime.registerRoute({
        path: "/federated-tabs",
        lazy: () => import("@sample/shared/FederatedTabsLayout.tsx")
    });

    runtime.registerNavigationItem({
        to: "/federated-tabs",
        $label: "Tabs"
    });
}

export const register: ModuleRegisterFunction<Runtime> = runtime => {
    registerRoutes(runtime);
};
