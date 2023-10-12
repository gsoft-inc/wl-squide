import { rest, type RestHandler } from "msw";
import { sessionManager } from "./session.ts";

export const subscriptionHandlers: RestHandler[] = [
    rest.get("/subscription", async (req, res, ctx) => {
        if (!sessionManager.getSession()) {
            return res(
                ctx.status(401)
            );
        }

        return res(
            ctx.status(200),
            ctx.json({
                status: "paid"
            })
        );
    })
];
