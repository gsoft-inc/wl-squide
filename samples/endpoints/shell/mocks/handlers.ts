import type { HttpHandler } from "msw";
import { authenticationHandlers } from "./authenticationHandlers.ts";
import { featureFlagHandlers } from "./featureFlagHandlers.ts";
import { subscriptionHandlers } from "./subscriptionHandlers.ts";

// Must specify the return type, otherwise we get a TS2742: The inferred type cannot be named without a reference to X. This is likely not portable.
// A type annotation is necessary.
export const requestHandlers: HttpHandler[] = [
    ...authenticationHandlers,
    ...featureFlagHandlers,
    ...subscriptionHandlers
];
