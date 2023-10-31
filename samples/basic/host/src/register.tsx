import type { ModuleRegisterFunction, Runtime } from "@squide/react-router";

function registerRoutes(runtime: Runtime) {
    runtime.registerRoute({
        index: true,
        lazy: () => import("./HomePage.tsx")
    });
}

export const registerHost: ModuleRegisterFunction<Runtime> = runtime => {
    return registerRoutes(runtime);
};
