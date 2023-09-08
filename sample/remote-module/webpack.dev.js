// @ts-check

import { defineDevRemoteModuleConfig } from "@squide/webpack-module-federation/defineConfig.js";
import { defineDevConfig } from "@workleap/webpack-configs";
import { swcConfig } from "./swc.dev.js";

let config;

if (!process.env.LOCAL) {
    config = defineDevRemoteModuleConfig(swcConfig, "remote1", 8081, {
        sharedDependencies: {
            "shared": {
                singleton: true
            }
        },
        environmentVariables: {
            "NETLIFY": process.env.NETLIFY === "true"
        }
    });
} else {
    config = defineDevConfig(swcConfig);
}

export default config;

