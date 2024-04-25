// @ts-check

import { isNetlify } from "@basic/shared";
import { defineDevHostConfig, defineDevRemoteModuleConfig } from "@squide/firefly-configs";
import path from "node:path";
import { swcConfig } from "./swc.dev.js";
import { getSharedDependencies } from "./webpack.common.js";

let config;

if (!process.env.ISOLATED) {
    config = defineDevRemoteModuleConfig(swcConfig, "remote1", 8081, {
        sharedDependencies: getSharedDependencies(false),
        environmentVariables: {
            "NETLIFY": isNetlify
        }
    });
} else {
    config = defineDevHostConfig(swcConfig, "remote1", 8080, [], {
        entry: path.resolve("./src/dev/index.tsx"),
        overlay: false,
        sharedDependencies: getSharedDependencies(true),
        environmentVariables: {
            "NETLIFY": isNetlify
        }
    });
}

export default config;

