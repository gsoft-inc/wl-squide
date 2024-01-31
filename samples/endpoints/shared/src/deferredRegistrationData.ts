import type { FeatureFlags } from "./featureFlags.ts";
import type { Session } from "./session.ts";

export interface DeferredRegistrationData {
    featureFlags?: FeatureFlags;
    session?: Session;
}
