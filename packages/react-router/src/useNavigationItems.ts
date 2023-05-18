import type { Runtime } from "./runtime.ts";
import { useRuntime } from "@squide/core";

export function useNavigationItems() {
    const runtime = useRuntime() as Runtime;

    return runtime.navigationItems;
}
