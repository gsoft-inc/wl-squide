import { useRuntime } from "@squide/core";
import type { Runtime } from "./runtime.ts";

export function useRoutes() {
    const runtime = useRuntime() as Runtime;

    return runtime.routes;
}
