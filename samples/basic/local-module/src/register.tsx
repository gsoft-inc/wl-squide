import type { AppContext } from "@basic/shared";
import type { ModuleRegisterFunction, Runtime } from "@squide/react-router";

function registerRoutes(runtime: Runtime) {
    runtime.registerRoute({
        path: "/message",
        lazy: () => import("./MessagePage.tsx")
    });

    runtime.registerNavigationItem({
        $label: "Message",
        // Higher numbers gets rendered first.
        $priority: 999,
        // Will be forwarded to the host application render function.
        $additionalProps: {
            highlight: true
        },
        to: "/message"
    });

    // Register federated tabs.

    runtime.registerRoute({
        index: true,
        lazy: () => import("./WorkleapTab.tsx")
    }, {
        parentPath: "/federated-tabs"
    });

    runtime.registerNavigationItem({
        $label: "Workleap",
        to: "/federated-tabs"
    }, {
        menuId: "/federated-tabs"
    });
}

export const registerLocalModule: ModuleRegisterFunction<Runtime, AppContext> = (runtime, context) => {
    console.log("Local module context: ", context);

    return registerRoutes(runtime);
};
