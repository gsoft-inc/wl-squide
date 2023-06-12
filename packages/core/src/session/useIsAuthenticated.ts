import { useSession } from "../runtime/useSession.ts";
import { isNil } from "../shared/assertions.ts";

export function useIsAuthenticated() {
    const session = useSession();

    return !isNil(session);
}
