import { rest, type RestHandler } from "msw";

export const hostRequestHandlers: RestHandler[] = [
    // TODO: If not logged in, return a 401 unauthorized
    rest.get("/session", (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json({
                name: "John Doe"
            })
        );
    }),

    rest.get("/feature-flags", (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json([
                { feature: "send-message", isActive: true },
                { feature: "list-ricky-and-morty-characters", isActive: true }
            ])
        );
    })
];
