import { HttpResponse, http, type HttpHandler } from "msw";
import { simulateDelay } from "./simulateDelay.ts";

let featureFlags = {
    featureA: true,
    featureB: true,
    featureC: false
};

// Must specify the return type, otherwise we get a TS2742: The inferred type cannot be named without a reference to X. This is likely not portable.
// A type annotation is necessary.
export const featureFlagsHandlers: HttpHandler[] = [
    http.get("/api/feature-flags", async () => {
        await simulateDelay(500);

        return HttpResponse.json(featureFlags);
    }),
    http.post("/api/shuffle-feature-flags", async () => {
        featureFlags = {
            featureA: Math.random() < 0.5,
            featureB: Math.random() < 0.5,
            featureC: Math.random() < 0.5
        };

        return new HttpResponse(null, {
            status: 200
        });
    })
];
