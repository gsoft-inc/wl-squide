// @ts-check

import { defineDevHostConfig } from "@squide/firefly-webpack-configs";
import { Remotes } from "./remotes.js";
import { swcConfig } from "./swc.dev.js";
import { features, getSharedDependencies } from "./webpack.common.js";

export default defineDevHostConfig(swcConfig, 8080, Remotes, {
    overlay: false,
    features,
    sharedDependencies: getSharedDependencies(),
    environmentVariables: {
        "NETLIFY": process.env.NETLIFY === "true",
        "USE_MSW": process.env.USE_MSW === "true"
    }
});
