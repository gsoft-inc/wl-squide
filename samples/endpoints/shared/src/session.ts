export interface Session {
    user: {
        id: number;
        name: string;
    };
}

export interface SessionManager {
    setSession: (session: Session) => void;
    getSession: () => Session | undefined;
    clearSession: () => void;
}
