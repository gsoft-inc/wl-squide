// @ts-check

import { defineDevRemoteModuleConfig } from "@squide/webpack-module-federation/defineConfig.js";
import { defineDevConfig } from "@workleap/webpack-configs";
import path from "node:path";
import { swcConfig } from "./swc.dev.js";

let config;

if (!process.env.LOCAL) {
    config = defineDevRemoteModuleConfig(swcConfig, "remote2", 8082, {
        sharedDependencies: {
            "@sample/shared": {
                singleton: true
            }
        },
        environmentVariables: {
            "NETLIFY": process.env.NETLIFY === "true"
        }
    });
} else {
    config = defineDevConfig(swcConfig, {
        entry: path.resolve("./src/dev/index.tsx"),
        overlay: false
    });
}

export default config;

