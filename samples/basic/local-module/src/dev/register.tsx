import type { ModuleRegisterFunction, Runtime } from "@squide/firefly";
import { DevHome } from "./DevHome.tsx";

export const registerDev: ModuleRegisterFunction<Runtime> = runtime => {
    runtime.registerRoute({
        index: true,
        element: <DevHome />
    });
};
