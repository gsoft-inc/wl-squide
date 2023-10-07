import type { Session } from "@sample/shared";
import { InvalidCredentialsError } from "@sample/shell";
import type { SessionAccessorFunction } from "@squide/react-router";
import axios from "axios";

export class SessionManager {
    #session?: Session;

    setSession(session: Session) {
        this.#session = session;
    }

    getSession() {
        // return this.#session;

        return {
            user: {
                name: "John Doe"
            }
        };
    }

    clearSession() {
        this.#session = undefined;
    }
}

export const sessionManager = new SessionManager();

export const sessionAccessor: SessionAccessorFunction = () => {
    return sessionManager.getSession();
};

export async function onLogin(username: string, password: string) {
    try {
        await axios.post("/login", {
            username,
            password
        });
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                throw new InvalidCredentialsError();
            }
        }

        throw new Error("An unknown error happened while trying to login a user");
    }
}

export async function onLogout() {
    sessionManager.clearSession();
}
