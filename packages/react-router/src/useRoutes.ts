import { Runtime } from "./runtime.ts";
import { useRuntime } from "@squide/core";

export function useRoutes() {
    const runtime = useRuntime() as Runtime;

    return runtime.routes;
}
