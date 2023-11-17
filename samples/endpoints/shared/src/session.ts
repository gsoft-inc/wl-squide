import type { LanguageKey } from "./i18next.ts";

export interface Session {
    user: {
        id: number;
        name: string;
        preferredLanguage: LanguageKey;
    };
}

export interface SessionManager {
    setSession: (session: Session) => void;
    getSession: () => Session | undefined;
    clearSession: () => void;
}
