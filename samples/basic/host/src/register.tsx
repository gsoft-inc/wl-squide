import type { ModuleRegisterFunction, Runtime } from "@squide/firefly";

function registerRoutes(runtime: Runtime) {
    runtime.registerRoute({
        index: true,
        lazy: () => import("./HomePage.tsx")
    });
}

export const registerHost: ModuleRegisterFunction<Runtime> = runtime => {
    return registerRoutes(runtime);
};
