import type { ModuleRegisterFunction, Runtime } from "@squide/react-router";

import { lazy } from "react";

const DistributedTabsLayout = lazy(() => import("./DistributedTabsLayout.tsx"));

export const register: ModuleRegisterFunction<Runtime> = runtime => {
    runtime.registerRoutes([
        {
            path: "/distributed-tabs",
            element: <DistributedTabsLayout />
        }
    ]);

    runtime.registerNavigationItems([
        {
            to: "/distributed-tabs",
            label: "Tabs"
        }
    ]);
};
