import type { AppContext } from "@sample/shared";
import type { ModuleRegisterFunction, Runtime } from "@squide/react-router";
import { lazy } from "react";

const About = lazy(() => import("./About.tsx"));
const Message = lazy(() => import("./Message.tsx"));

export const register: ModuleRegisterFunction<Runtime, AppContext> = (runtime, context) => {
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
            label: "About"
        },
        {
            to: "/message",
            label: "Message",
            // Higher numbers gets rendered first.
            priority: 999,
            // Will be forwarded to the host application render function.
            additionalProps: {
                highlight: true
            }
        }
    ]);
};
