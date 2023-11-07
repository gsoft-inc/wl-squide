import { HttpResponse, http, type HttpHandler } from "msw";
import { sessionManager } from "./session.ts";

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
