import { rest, type RestHandler } from "msw";

interface Session {
    username: string;
}

let currentSession: Session | undefined;

function simulateDelay(delay: number) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(undefined);
        }, delay);
    });
}

export const hostRequestHandlers: RestHandler[] = [
    rest.post("/login", async (req, res, ctx) => {
        const { username, password } = await req.json();

        if (username !== "temp" || password !== "temp") {
            return res(
                ctx.status(401)
            );
        }

        await simulateDelay(2000);

        currentSession = {
            username: username
        };

        return res(
            ctx.status(200)
        );
    }),

    rest.post("/logout", async (req, res, ctx) => {
        currentSession = undefined;

        return res(
            ctx.status(200)
        );
    }),

    rest.get("/session", async (req, res, ctx) => {
        // if (!currentSession) {
        //     return res(
        //         ctx.status(401)
        //     );
        // }

        await simulateDelay(500);

        // return res(
        //     ctx.status(200),
        //     ctx.json(currentSession)
        // );

        return res(
            ctx.status(200),
            ctx.json({
                username: "John Doe"
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
