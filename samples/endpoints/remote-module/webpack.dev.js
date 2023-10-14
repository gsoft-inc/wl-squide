// @ts-check

import { defineDevRemoteModuleConfig } from "@squide/webpack-module-federation/defineConfig.js";
import { defineDevConfig } from "@workleap/webpack-configs";
import path from "node:path";
import { swcConfig } from "./swc.dev.js";

let config;

if (!process.env.LOCAL) {
    config = defineDevRemoteModuleConfig(swcConfig, "remote1", 8081, {
        sharedDependencies: {
            "@endpoints/shared": {
                singleton: true
            }
        },
        environmentVariables: {
            "NETLIFY": process.env.NETLIFY === "true",
            "LOCAL": process.env.LOCAL === "true",
            "USE_MSW": process.env.USE_MSW === "true"
        }
    });
} else {
    config = defineDevConfig(swcConfig, {
        cache: false,
        entry: path.resolve("./src/dev/index.tsx"),
        overlay: false,
        environmentVariables: {
            "LOCAL": process.env.LOCAL === "true",
            "USE_MSW": process.env.USE_MSW === "true"
        }
    });
}

export default config;

