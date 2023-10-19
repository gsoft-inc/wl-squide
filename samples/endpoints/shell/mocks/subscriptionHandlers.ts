import { rest, type RestHandler } from "msw";
import { sessionManager } from "./session.ts";

export const subscriptionHandlers: RestHandler[] = [
    rest.get("/api/subscription", async (req, res, ctx) => {
        if (!sessionManager.getSession()) {
            return res(
                ctx.status(401)
            );
        }

        return res(
            ctx.status(200),
            ctx.json({
                company: "Workleap",
                contact: "John Doe",
                status: "paid"
            })
        );
    })
];
