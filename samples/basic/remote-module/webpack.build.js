// @ts-check

import { defineBuildRemoteModuleConfig } from "@squide/firefly/defineConfig.js";
import { swcConfig } from "./swc.build.js";
import { getSharedDependencies } from "./webpack.common.js";

export default defineBuildRemoteModuleConfig(swcConfig, "remote1", {
    sharedDependencies: getSharedDependencies(false),
    environmentVariables: {
        "NETLIFY": process.env.NETLIFY === "true"
    }
});
