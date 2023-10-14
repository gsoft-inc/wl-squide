// @ts-check

import { defineDevRemoteModuleConfig } from "@squide/webpack-module-federation/defineConfig.js";
import { defineDevConfig } from "@workleap/webpack-configs";
import path from "node:path";
import { swcConfig } from "./swc.dev.js";

let config;

if (!process.env.LOCAL) {
    config = defineDevRemoteModuleConfig(swcConfig, "remote1", 8081, {
        sharedDependencies: {
            "@basic/shared": {
                singleton: true
            }
        },
        environmentVariables: {
            "NETLIFY": process.env.NETLIFY === "true"
        }
    });
} else {
    config = defineDevConfig(swcConfig, {
        cache: false,
        entry: path.resolve("./src/dev/index.tsx"),
        overlay: false
    });
}

export default config;

