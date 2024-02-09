import type { FireflyRuntime, ModuleRegisterFunction } from "@squide/firefly";

function registerRoutes(runtime: FireflyRuntime) {
    runtime.registerRoute({
        path: "/federated-tabs/officevibe",
        lazy: () => import("./OfficevibeTab.tsx")
    }, {
        parentPath: "/federated-tabs"
    });

    runtime.registerNavigationItem({
        $label: "Officevibe",
        $to: "/federated-tabs/officevibe"
    }, {
        menuId: "/federated-tabs"
    });
}

export const register: ModuleRegisterFunction<FireflyRuntime> = runtime => {
    return registerRoutes(runtime);
};
