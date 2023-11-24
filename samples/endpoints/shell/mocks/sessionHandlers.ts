import { HttpResponse, http, type HttpHandler } from "msw";
import { sessionManager } from "./session.ts";
import { simulateDelay } from "./simulateDelay.ts";

// Must specify the return type, otherwise we get a TS2742: The inferred type cannot be named without a reference to X. This is likely not portable.
// A type annotation is necessary.
export const sessionHandlers: HttpHandler[] = [
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
