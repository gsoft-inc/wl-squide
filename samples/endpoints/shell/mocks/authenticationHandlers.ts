import { HttpResponse, http, type HttpHandler } from "msw";
import { sessionManager } from "./session.ts";

interface LoginCredentials {
    username: string;
    password: string;
}

function simulateDelay(delay: number) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(undefined);
        }, delay);
    });
}

export const authenticationHandlers: HttpHandler[] = [
    http.post("/api/login", async ({ request }) => {
        const { username, password } = await request.json() as LoginCredentials;

        if (username !== "temp" || password !== "temp") {
            return new HttpResponse(null, {
                status: 401
            });
        }

        await simulateDelay(1000);

        sessionManager.setSession({
            userId: Math.random(),
            username
        });

        return new HttpResponse(null, {
            status: 200
        });
    }),

    http.post("/api/logout", async () => {
        sessionManager.clearSession();

        return new HttpResponse(null, {
            status: 200
        });
    }),

    http.get("/api/session", async () => {
        const session = sessionManager.getSession();

        if (!session) {
            return new HttpResponse(null, {
                status: 401
            });
        }

        await simulateDelay(500);

        return HttpResponse.json(session);
    })
];
