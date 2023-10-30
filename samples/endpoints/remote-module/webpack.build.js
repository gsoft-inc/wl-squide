// @ts-check

import { defineBuildRemoteModuleConfig } from "@squide/webpack-module-federation/defineConfig.js";
import { swcConfig } from "./swc.build.js";

// The trailing / is very important, otherwise paths will not be resolved correctly.
const publicPath = process.env.NETLIFY === "true" ? "https://squide-endpoints-remote-module.netlify.app/" : "http://localhost:8081/";

function tempTransformer(config) {
    config.output.publicPath = "auto";

    return config;
}

export default defineBuildRemoteModuleConfig(swcConfig, "remote1", publicPath, {
    features: {
        msw: true
    },
    sharedDependencies: {
        "@endpoints/shared": {
            singleton: true
        }
    },
    environmentVariables: {
        "NETLIFY": process.env.NETLIFY === "true",
        "USE_MSW": process.env.USE_MSW === "true"
    },
    transformers: [tempTransformer]
});
