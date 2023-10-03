import { rest, type RestHandler } from "msw";

export const hostRequestHandlers: RestHandler[] = [
    rest.get("/feature-flags", (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json([
                { feature: "send-message", isActive: true },
                { feature: "ricky-and-morty-characters", isActive: true }
            ])
        );
    })
];
