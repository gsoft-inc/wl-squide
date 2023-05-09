import type { AppContext } from "shared";
import { ModuleRegisterFunction } from "@squide/react-router";
import type { Runtime } from "@squide/react-router";
import { lazy } from "react";

const About = lazy(() => import("./About.tsx"));

export const register: ModuleRegisterFunction = (runtime: Runtime, context: AppContext) => {
    console.log("Context: ", context);

    runtime.registerRoutes([
        {
            path: "/about",
            element: <About />
        }
    ]);

    runtime.registerNavigationItems([
        {
            to: "/about",
            content: "About"
        }
    ]);
};
