import type { ModuleRegisterFunction, Runtime } from "@squide/firefly";
import { DevHomePage } from "./DevHomePage.tsx";

export const registerDev: ModuleRegisterFunction<Runtime> = runtime => {
    runtime.registerRoute({
        index: true,
        element: <DevHomePage />
    });
};
