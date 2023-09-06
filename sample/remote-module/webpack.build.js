// @ts-check

import { defineBuildRemoteModuleConfig } from "@squide/webpack-module-federation/defineConfig.js";
import { swcConfig } from "./swc.build.js";

// The trailing / is very important, otherwise paths will ne be resolved correctly.
const publicPath = process.env.NETLIFY === "true" ? "https://squide-remote-module.netlify.app/" : "http://localhost:8081/";

export default defineBuildRemoteModuleConfig(swcConfig, "remote1", publicPath, {
    sharedDependencies: {
        "shared": {
            singleton: true
        }
    },
    environmentVariables: {
        "NETLIFY": process.env.NETLIFY === "true"
    }
});
