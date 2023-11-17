import { HttpResponse, http, type HttpHandler } from "msw";
import { sessionManager } from "./session.ts";
import { simulateDelay } from "./simulateDelay.ts";

interface LoginCredentials {
    username: string;
    password: string;
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
            username,
            preferredLanguage: "fr-CA"
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
    })
];
