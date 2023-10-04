import type { AppContext } from "@sample/shared";
import type { ModuleRegisterFunction, Runtime } from "@squide/react-router";

export const register: ModuleRegisterFunction<Runtime, AppContext> = (runtime, context) => {
    console.log("Local module context: ", context);

    runtime.registerRoutes([
        {
            path: "/about",
            lazy: () => import("./About.tsx")
        },
        {
            path: "/message",
            lazy: () => import("./Message.tsx")
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
            lazy: () => import("./WorkleapTab.tsx")
        }
    ], { layoutPath: "/federated-tabs" });

    runtime.registerNavigationItems([
        {
            to: "/federated-tabs",
            label: "Workleap"
        }
    ], { menuId: "/federated-tabs" });
};
