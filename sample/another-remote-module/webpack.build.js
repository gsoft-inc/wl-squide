// @ts-check

import { defineBuildRemoteModuleConfig } from "@squide/webpack-module-federation/defineConfig.js";
import { swcConfig } from "./swc.build.js";

// The trailing / is very important, otherwise paths will not be resolved correctly.
const publicPath = process.env.NETLIFY === "true" ? "https://squide-another-remote-module.netlify.app/" : "http://localhost:8082/";

export default defineBuildRemoteModuleConfig(swcConfig, "remote2", publicPath, {
    sharedDependencies: {
        "@sample/shared": {
            singleton: true
        }
    },
    environmentVariables: {
        "NETLIFY": process.env.NETLIFY === "true"
    }
});
