import { HttpResponse, http, type HttpHandler } from "msw";

function simulateDelay(delay: number) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(undefined);
        }, delay);
    });
}

export const featureFlagHandlers: HttpHandler[] = [
    http.get("/api/feature-flags", async () => {
        await simulateDelay(500);

        return HttpResponse.json({
            featureA: true,
            featureB: true,
            featureC: false
        });
    })
];
