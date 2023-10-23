import { rest, type RestHandler } from "msw";

function simulateDelay(delay: number) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(undefined);
        }, delay);
    });
}

export const featureFlagHandlers: RestHandler[] = [
    rest.get("/api/feature-flags", async (req, res, ctx) => {
        await simulateDelay(500);

        return res(
            ctx.status(200),
            ctx.json({
                featureA: true,
                featureB: true,
                featureC: false
            })
        );
    })
];
