import { AbstractRuntime } from "./abstractRuntime.ts";
import { useRuntime } from "./RuntimeContext.ts";

export function useSession() {
    const runtime = useRuntime() as AbstractRuntime;

    return runtime.getSession();
}
