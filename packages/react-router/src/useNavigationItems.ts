import { useRuntime } from "@squide/core";
import type { Runtime } from "./runtime.ts";

export function useNavigationItems() {
    const runtime = useRuntime() as Runtime;

    return runtime.navigationItems;
}
