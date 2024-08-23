import { HttpResponse, http, type HttpHandler } from "msw";
import { featureFlagsAccessor } from "./featureFlags.ts";
import { sessionAccessor } from "./session.ts";

export const featureBHandlers: HttpHandler[] = [
    http.get("/api/feature-b", async () => {
        const session = sessionAccessor.getSession();

        if (!session) {
            return new HttpResponse(null, {
                status: 401
            });
        }

        const featureFlags = featureFlagsAccessor.getFeatureFlags();

        if (!featureFlags.featureB) {
            return new HttpResponse(null, {
                status: 403
            });
        }

        const isEn = session.preferredLanguage === "en-US";

        if (isEn) {
            return HttpResponse.json({
                message: "This page is only available if the <code>featureB</code> flag is active."
            });
        } else {
            return HttpResponse.json({
                message: "Cette page est uniquement disponible si la fonctionnalité <code>featureB</code> est activé."
            });
        }
    })
];
