// @ts-check

import { isNetlify } from "@endpoints/shared";
import { defineDevHostConfig } from "@squide/firefly-configs";
import { Remotes } from "./remotes.js";
import { swcConfig } from "./swc.dev.js";
import { features, getSharedDependencies } from "./webpack.common.js";

export default defineDevHostConfig(swcConfig, "host", 8080, Remotes, {
    overlay: false,
    features,
    sharedDependencies: getSharedDependencies(),
    environmentVariables: {
        "NETLIFY": isNetlify,
        "USE_MSW": process.env.USE_MSW === "true"
    }
});
