// @ts-check

import { defineDevHostConfig, defineDevRemoteModuleConfig } from "@squide/firefly-webpack-configs";
import path from "node:path";
import { swcConfig } from "./swc.dev.js";
import { features, getSharedDependencies } from "./webpack.common.js";

let config;

if (!process.env.ISOLATED) {
    config = defineDevRemoteModuleConfig(swcConfig, "remote1", 8081, {
        features,
        sharedDependencies: getSharedDependencies(false),
        environmentVariables: {
            "NETLIFY": process.env.NETLIFY === "true",
            "ISOLATED": process.env.ISOLATED === "true",
            "USE_MSW": process.env.USE_MSW === "true"
        }
    });
} else {
    config = defineDevHostConfig(swcConfig, 8080, [], {
        overlay: false,
        entry: path.resolve("./src/dev/index.tsx"),
        features,
        sharedDependencies: getSharedDependencies(true),
        environmentVariables: {
            "ISOLATED": process.env.ISOLATED === "true",
            "USE_MSW": process.env.USE_MSW === "true"
        }
    });
}

export default config;

