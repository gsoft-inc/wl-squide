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

// Must specify the return type, otherwise we get a TS2742: The inferred type cannot be named without a reference to X. This is likely not portable.
// A type annotation is necessary.
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
