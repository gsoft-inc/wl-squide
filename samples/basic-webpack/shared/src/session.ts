import { createContext, useContext } from "react";

export interface Session {
    user: {
        name: string;
    };
}

export interface SessionManager {
    setSession: (session: Session) => void;
    getSession: () => Session | undefined;
    clearSession: () => void;
}

export const SessionManagerContext = createContext<SessionManager | undefined>(undefined);

export function useSessionManager() {
    return useContext(SessionManagerContext);
}

export function useSession() {
    const sessionManager = useSessionManager();

    return sessionManager?.getSession();
}

export function useIsAuthenticated() {
    const sessionManager = useSessionManager();

    return !!sessionManager?.getSession();
}
