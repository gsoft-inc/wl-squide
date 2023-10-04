import type { Session, SessionManager } from "@sample/shared";
// import type { Session } from "@sample/shared";
import { LocalStorageSessionManager } from "@squide/fakes";
import type { SessionAccessorFunction } from "@squide/react-router";
// import type { QueryClient } from "@tanstack/react-query";
// import axios from "axios";

export const sessionManager = new LocalStorageSessionManager<Session>() as SessionManager;

// export const SessionQueryKey = ["/session"];

// export const sessionQuery = {
//     queryKey: SessionQueryKey,
//     queryFn: async () => {
//         const { data } = await axios.get("/session");

//         return data;
//     }
// };

// export class SessionManager {
//     readonly #queryClient: QueryClient;

//     constructor(queryClient: QueryClient) {
//         this.#queryClient = queryClient;
//     }

//     getSession() {
//         this.#queryClient.getQueryData(SessionQueryKey);
//     }
// }

// export async function fetchSession() {
//     const { data } = await axios.get("/session");

//     return data;
// }

// export class SessionManager {
//     #session?: Session;

//     setSession(session: Session) {
//         this.#session = session;
//     }

//     getSession() {
//         return this.#session;
//     }

//     clearSession() {
//         this.#session = undefined;
//     }
// }

// export const sessionManager = new SessionManager();

export const sessionAccessor: SessionAccessorFunction = () => {
    return sessionManager.getSession();
};
