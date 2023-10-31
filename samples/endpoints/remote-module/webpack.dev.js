// @ts-check

import { defineDevHostConfig, defineDevRemoteModuleConfig } from "@squide/webpack-module-federation/defineConfig.js";
import path from "node:path";
import { swcConfig } from "./swc.dev.js";

let config;

if (!process.env.ISOLATED) {
    config = defineDevRemoteModuleConfig(swcConfig, "remote1", 8081, {
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
            "ISOLATED": process.env.ISOLATED === "true",
            "USE_MSW": process.env.USE_MSW === "true"
        }
    });
} else {
    config = defineDevHostConfig(swcConfig, "remote1", 8080, {
        overlay: false,
        entry: path.resolve("./src/dev/index.tsx"),
        environmentVariables: {
            "ISOLATED": process.env.ISOLATED === "true",
            "USE_MSW": process.env.USE_MSW === "true"
        }
    });
}

export default config;

