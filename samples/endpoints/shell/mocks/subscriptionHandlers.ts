import { HttpResponse, http, type HttpHandler } from "msw";
import { sessionManager } from "./session.ts";

// Must specify the return type, otherwise we get a TS2742: The inferred type cannot be named without a reference to X. This is likely not portable.
// A type annotation is necessary.
export const subscriptionHandlers: HttpHandler[] = [
    http.get("/api/subscription", async () => {
        if (!sessionManager.getSession()) {
            return new HttpResponse(null, {
                status: 401
            });
        }

        return HttpResponse.json({
            company: "Workleap",
            contact: "John Doe",
            status: "paid"
        });
    })
];
