// @ts-check

import { defineBuildHostConfig } from "@squide/firefly-webpack-configs";
import { Remotes } from "./remotes.js";
import { swcConfig } from "./swc.build.js";
import { features, getSharedDependencies } from "./webpack.common.js";

export default defineBuildHostConfig(swcConfig, Remotes, {
    features,
    sharedDependencies: getSharedDependencies(),
    environmentVariables: {
        "NETLIFY": process.env.NETLIFY === "true",
        "USE_MSW": process.env.USE_MSW === "true"
    }
});

