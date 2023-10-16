import type { ModuleRegisterFunction, Runtime } from "@squide/react-router";

function registerRoutes(runtime: Runtime) {
    runtime.registerRoute({
        path: "/federated-tabs",
        lazy: async () => {
            const { FederatedTabsLayout } = await import("@basic/shared/FederatedTabsLayout.tsx");

            return {
                element: <FederatedTabsLayout host="@basic/another-remote-module" />
            };
        }
    });

    runtime.registerNavigationItem({
        $label: "Tabs",
        to: "/federated-tabs"
    });
}

export const register: ModuleRegisterFunction<Runtime> = runtime => {
    registerRoutes(runtime);
};
