import { rest, type RestHandler } from "msw";

const SessionKey = "msw-session";

function simulateDelay(delay: number) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(undefined);
        }, delay);
    });
}

export const authenticationHandlers: RestHandler[] = [
    rest.post("/login", async (req, res, ctx) => {
        const { username, password } = await req.json();

        if (username !== "temp" || password !== "temp") {
            return res(
                ctx.status(401)
            );
        }

        await simulateDelay(2000);

        window.localStorage.setItem(SessionKey, JSON.stringify({
            username
        }));

        return res(
            ctx.status(200)
        );
    }),

    rest.post("/logout", async (req, res, ctx) => {
        window.localStorage.removeItem(SessionKey);

        return res(
            ctx.status(200)
        );
    }),

    rest.get("/session", async (req, res, ctx) => {
        const session = window.localStorage.getItem(SessionKey);

        if (!session) {
            return res(
                ctx.status(401)
            );
        }

        await simulateDelay(500);

        return res(
            ctx.status(200),
            ctx.json(JSON.parse(session))
        );
    })
];
