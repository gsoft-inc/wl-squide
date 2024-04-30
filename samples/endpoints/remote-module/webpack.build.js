// @ts-check

import { defineBuildHostConfig, defineBuildRemoteModuleConfig } from "@squide/firefly-webpack-configs";
import path from "node:path";
import { swcConfig } from "./swc.build.js";
import { features, getSharedDependencies } from "./webpack.common.js";

let config;

if (!process.env.ISOLATED) {
    config = defineBuildRemoteModuleConfig(swcConfig, "remote1", {
        features,
        sharedDependencies: getSharedDependencies(false),
        environmentVariables: {
            "NETLIFY": process.env.NETLIFY === "true",
            "USE_MSW": process.env.USE_MSW === "true"
        }
    });
} else {
    config = defineBuildHostConfig(swcConfig, "remote1", [], {
        entry: path.resolve("./src/dev/index.tsx"),
        features,
        sharedDependencies: getSharedDependencies(true),
        environmentVariables: {
            "NETLIFY": process.env.NETLIFY === "true",
            "USE_MSW": process.env.USE_MSW === "true"
        }
    });
}

export default config;
