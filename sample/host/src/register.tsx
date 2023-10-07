import type { ModuleRegisterFunction, Runtime } from "@squide/react-router";

export const registerHost: ModuleRegisterFunction<Runtime> = runtime => {
    runtime.registerRoute({
        index: true,
        lazy: () => import("./Home.tsx")
    });
};
