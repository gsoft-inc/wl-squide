// @ts-check

import { defineBuildHostConfig } from "@squide/firefly-configs";
import { swcConfig } from "./swc.build.js";
import { features, getSharedDependencies } from "./webpack.common.js";

export default defineBuildHostConfig(swcConfig, "host", {
    features,
    sharedDependencies: getSharedDependencies(true),
    environmentVariables: {
        "NETLIFY": process.env.NETLIFY === "true",
        "USE_MSW": process.env.USE_MSW === "true"
    }
});

