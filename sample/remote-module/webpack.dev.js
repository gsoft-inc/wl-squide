// @ts-check

import { defineDevRemoteModuleConfig } from "@squide/webpack-module-federation/defineConfig.js";
import { defineDevConfig } from "@workleap/webpack-configs";
import path from "node:path";
import { swcConfig } from "./swc.dev.js";

let config;

if (!process.env.LOCAL) {
    config = defineDevRemoteModuleConfig(swcConfig, "remote1", 8081, {
        sharedDependencies: {
            "@tanstack/react-query": {
                singleton: true
            },
            "@sample/shared": {
                singleton: true
            }
        },
        environmentVariables: {
            "NETLIFY": process.env.NETLIFY === "true",
            "USE_MSW": process.env.USE_MSW === "true"
        }
    });
} else {
    config = defineDevConfig(swcConfig, {
        entry: path.resolve("./src/dev/index.tsx"),
        environmentVariables: {
            "USE_MSW": process.env.USE_MSW === "true"
        }
    });
}

export default config;

