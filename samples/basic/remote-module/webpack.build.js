// @ts-check

import { defineBuildRemoteModuleConfig } from "@squide/firefly/defineConfig.js";
import { swcConfig } from "./swc.build.js";

export default defineBuildRemoteModuleConfig(swcConfig, "remote1", {
    sharedDependencies: {
        "@basic/shared": {
            singleton: true
        }
    },
    environmentVariables: {
        "NETLIFY": process.env.NETLIFY === "true"
    }
});
