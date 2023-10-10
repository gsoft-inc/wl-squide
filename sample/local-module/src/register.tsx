import type { AppContext } from "@sample/shared";
import type { ModuleRegisterFunction, Runtime } from "@squide/react-router";

export const registerLocalModule: ModuleRegisterFunction<Runtime, AppContext> = (runtime, context) => {
    console.log("Local module context: ", context);

    runtime.registerRoute({
        path: "/about",
        lazy: () => import("./About.tsx")
    });

    runtime.registerRoute({
        path: "/message",
        lazy: () => import("./Message.tsx")
    });

    runtime.registerNavigationItem({
        to: "/about",
        label: "About"
    });

    runtime.registerNavigationItem({
        to: "/message",
        label: "Message",
        // Higher numbers gets rendered first.
        priority: 999,
        // Will be forwarded to the host application render function.
        additionalProps: {
            highlight: true
        }
    });

    // Register federated tabs.

    runtime.registerRoute({
        index: true,
        lazy: () => import("./WorkleapTab.tsx")
    }, {
        parentPath: "/federated-tabs"
    });

    runtime.registerNavigationItem({
        to: "/federated-tabs",
        label: "Workleap"
    }, {
        menuId: "/federated-tabs"
    });
};
