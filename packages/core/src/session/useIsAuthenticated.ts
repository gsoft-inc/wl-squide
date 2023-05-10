import { isNil } from "../shared/assertions.ts";
import { useSession } from "../runtime/useSession.ts";

export function useIsAuthenticated() {
    const session = useSession();

    return !isNil(session);
}
