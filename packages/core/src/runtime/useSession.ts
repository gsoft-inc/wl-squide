import { useRuntime } from "./RuntimeContext.ts";

export function useSession() {
    const runtime = useRuntime();

    return runtime.getSession();
}
