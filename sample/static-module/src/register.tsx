import type { AppContext } from "shared";
import { ModuleRegisterFunction } from "@squide/react-router";
import type { Runtime } from "@squide/react-router";
import { lazy } from "react";

const About = lazy(() => import("./About.tsx"));
const Message = lazy(() => import("./Message.tsx"));

export const register: ModuleRegisterFunction = (runtime: Runtime, context: AppContext) => {
    console.log("Context: ", context);

    runtime.registerRoutes([
        {
            path: "/about",
            element: <About />
        },
        {
            path: "/message",
            element: <Message />
        }
    ]);

    runtime.registerNavigationItems([
        {
            to: "/about",
            content: "About"
        },
        {
            to: "/message",
            content: "Message",
            priority: 999,
            additionalProps: {
                highlight: true
            }
        }
    ]);
};
