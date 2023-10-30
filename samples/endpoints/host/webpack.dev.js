// @ts-check

import { defineDevHostConfig } from "@squide/webpack-module-federation/defineConfig.js";
import { swcConfig } from "./swc.dev.js";

function tempTransformer(config) {
    config.output.publicPath = "auto";

    return config;
}

export default defineDevHostConfig(swcConfig, "host", 8080, {
    overlay: false,
    features: {
        msw: true
    },
    sharedDependencies: {
        "@endpoints/shared": {
            singleton: true,
            eager: true
        }
    },
    environmentVariables: {
        "NETLIFY": process.env.NETLIFY === "true",
        "USE_MSW": process.env.USE_MSW === "true"
    },
    transformers: [tempTransformer]
});
