import type { AppContext } from "@basic-mix/shared";
import type { FireflyRuntime, ModuleRegisterFunction } from "@squide/firefly";

function registerRoutes(runtime: FireflyRuntime) {
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

export const registerLocalModule: ModuleRegisterFunction<FireflyRuntime, AppContext> = (runtime, context) => {
    console.log("Local module context: ", context);

    return registerRoutes(runtime);
};
