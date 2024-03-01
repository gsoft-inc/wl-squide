// @ts-check

import { defineDevHostConfig } from "@squide/firefly-configs";
import { swcConfig } from "./swc.dev.js";
import { features, getSharedDependencies } from "./webpack.common.js";

export default defineDevHostConfig(swcConfig, "host", 8080, {
    overlay: false,
    features,
    sharedDependencies: getSharedDependencies(true),
    environmentVariables: {
        "NETLIFY": process.env.NETLIFY === "true",
        "USE_MSW": process.env.USE_MSW === "true"
    }
});
