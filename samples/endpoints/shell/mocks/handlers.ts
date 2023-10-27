import type { RestHandler } from "msw";
import { authenticationHandlers } from "./authenticationHandlers.ts";
import { featureFlagHandlers } from "./featureFlagHandlers.ts";
import { subscriptionHandlers } from "./subscriptionHandlers.ts";

export const requestHandlers: RestHandler[] = [
    ...authenticationHandlers,
    ...featureFlagHandlers,
    ...subscriptionHandlers
];
