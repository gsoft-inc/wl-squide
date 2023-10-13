import type { ModuleRegisterFunction, Runtime } from "@squide/react-router";

function registerRoutes(runtime: Runtime) {
    runtime.registerRoute({
        path: "/federated-tabs",
        lazy: () => import("@basic/shared/FederatedTabsLayout.tsx")
    });

    runtime.registerNavigationItem({
        $label: "Tabs",
        to: "/federated-tabs"
    });
}

export const register: ModuleRegisterFunction<Runtime> = runtime => {
    registerRoutes(runtime);
};
