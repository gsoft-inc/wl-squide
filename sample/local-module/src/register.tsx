import type { AppContext } from "@sample/shared";
import type { ModuleRegisterFunction, Runtime } from "@squide/react-router";
import { lazy } from "react";

const About = lazy(() => import("./About.tsx"));
const Message = lazy(() => import("./Message.tsx"));
const WorkleapTab = lazy(() => import("./WorkleapTab.tsx"));

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

    ///////

    runtime.registerRoutes([
        {
            index: true,
            element: <WorkleapTab />
        }
    ], { layoutPath: "/federated-tabs" });

    runtime.registerNavigationItems([
        {
            to: "/federated-tabs",
            label: "Workleap"
        }
    ], { menuId: "/federated-tabs" });
};
