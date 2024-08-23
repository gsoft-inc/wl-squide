import type { FireflyRuntime, ModuleRegisterFunction } from "@squide/firefly";
import { Page } from "./Page.tsx";

export const register: ModuleRegisterFunction<FireflyRuntime> = runtime => {
    runtime.registerRoute({
        path: "/remote/page",
        element: <Page />
    });

    runtime.registerNavigationItem({
        $key: "remote-page",
        $label: "Remote/Page",
        to: "/remote/page"
    });
};
