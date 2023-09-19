// @ts-check

import { defineDevHostConfig } from "@squide/webpack-module-federation/defineConfig.js";
import { swcConfig } from "./swc.dev.js";

export default defineDevHostConfig(swcConfig, "host", 8080, {
    sharedDependencies: {
        "@sample/shared": {
            singleton: true,
            eager: true
        }
    },
    environmentVariables: {
        "NETLIFY": process.env.NETLIFY === "true"
    }
});
