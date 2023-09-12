import type { AppContext } from "@sample/shared";
import type { ModuleRegisterFunction, Runtime } from "@squide/react-router";
import { lazy } from "react";

const DistributedTabsLayout = lazy(() => import("./DistributedTabsLayout.tsx"));

export const registerDistributedTabsPage: ModuleRegisterFunction<Runtime, AppContext> = runtime => {
    runtime.registerRoutes([
        {
            path: "/distributed-tabs",
            element: <DistributedTabsLayout />
        }
    ]);

    runtime.registerNavigationItems([
        {
            to: "distributed-tabs",
            label: "Distributed tabs"
        }
    ]);
};
