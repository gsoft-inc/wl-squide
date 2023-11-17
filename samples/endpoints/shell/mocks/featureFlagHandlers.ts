import { HttpResponse, http, type HttpHandler } from "msw";
import { simulateDelay } from "./simulateDelay.ts";

// Must specify the return type, otherwise we get a TS2742: The inferred type cannot be named without a reference to X. This is likely not portable.
// A type annotation is necessary.
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
