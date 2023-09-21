import type { ModuleRegisterFunction, Runtime } from "@squide/react-router";
import { lazy } from "react";

const FederatedTabsLayout = lazy(() => import("@sample/shared/FederatedTabsLayout.tsx"));

export const registerTabsPage: ModuleRegisterFunction<Runtime> = runtime => {
    runtime.registerRoutes([
        {
            path: "/federated-tabs",
            element: <FederatedTabsLayout />
        }
    ]);

    runtime.registerNavigationItems([
        {
            to: "/federated-tabs",
            label: "Tabs"
        }
    ]);
};
