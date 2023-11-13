import type { FireflyRuntime, ModuleRegisterFunction } from "@squide/firefly";

function registerRoutes(runtime: FireflyRuntime) {
    runtime.registerRoute({
        index: true,
        lazy: () => import("./HomePage.tsx")
    });
}

export const registerHost: ModuleRegisterFunction<FireflyRuntime> = runtime => {
    return registerRoutes(runtime);
};
