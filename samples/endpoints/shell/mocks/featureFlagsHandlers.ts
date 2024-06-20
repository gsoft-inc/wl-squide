import { HttpResponse, http, type HttpHandler } from "msw";
import { featureFlagsManager } from "./featureFlags.ts";
import { simulateDelay } from "./simulateDelay.ts";

// Must specify the return type, otherwise we get a TS2742: The inferred type cannot be named without a reference to X. This is likely not portable.
// A type annotation is necessary.
export const featureFlagsHandlers: HttpHandler[] = [
    http.get("/api/feature-flags", async () => {
        const featureFlags = featureFlagsManager.getFeatureFlags();

        await simulateDelay(500);

        return HttpResponse.json(featureFlags);
    }),
    http.post("/api/shuffle-feature-flags", async () => {
        const newFeatureFlags = {
            featureA: Math.random() < 0.5,
            featureB: true,
            featureC: Math.random() < 0.5
        };

        featureFlagsManager.setFeatureFlags(newFeatureFlags);

        console.log("[endpoints] New feature flags are:", newFeatureFlags);

        return new HttpResponse(null, {
            status: 200
        });
    }),
    http.post("/api/deactivate-feature-b", async () => {
        featureFlagsManager.setFeatureFlags({
            featureA: true,
            featureB: false,
            featureC: true
        });

        return new HttpResponse(null, {
            status: 200
        });
    })
];
