import type { ModuleRegisterFunction, Runtime } from "@squide/firefly";

function registerRoutes(runtime: Runtime) {
    runtime.registerRoute({
        path: "/federated-tabs/officevibe",
        lazy: () => import("./OfficevibeTab.tsx")
    }, {
        parentPath: "/federated-tabs"
    });

    runtime.registerNavigationItem({
        $label: "Officevibe",
        to: "/federated-tabs/officevibe"
    }, {
        menuId: "/federated-tabs"
    });
}

export const register: ModuleRegisterFunction<Runtime> = runtime => {
    return registerRoutes(runtime);
};
