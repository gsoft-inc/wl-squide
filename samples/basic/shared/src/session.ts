export interface Session {
    user: {
        name: string;
    };
}

export interface SessionManager {
    setSession: (session: Session) => void;
    getSession: () => Session;
    clearSession: () => void;
}
