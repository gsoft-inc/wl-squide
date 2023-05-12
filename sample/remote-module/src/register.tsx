import type { ModuleRegisterFunction, Runtime } from "@squide/react-router";

import { lazy } from "react";

const Remote = lazy(() => import("./Remote.tsx"));
const Hoisted = lazy(() => import("./Hoisted.tsx"));

export const register: ModuleRegisterFunction = (runtime: Runtime) => {
    runtime.registerRoutes([
        {
            path: "/remote",
            element: <Remote />
        },
        {
            hoist: true,
            path: "/hoisted",
            element: <Hoisted />
        }
    ]);

    runtime.registerNavigationItems([
        {
            to: "/remote",
            content: "Remote"
        },
        {
            to: "/hoisted",
            content: "Hoisted"
        }
    ]);
};
