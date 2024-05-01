// @ts-check

import { isNetlify } from "@basic/shared";
import { defineDevHostConfig } from "@squide/firefly-webpack-configs";
import path from "node:path";
import { swcConfig } from "./swc.config.js";

export default defineDevHostConfig(swcConfig, 8080, [], {
    entry: path.resolve("./src/dev/index.tsx"),
    overlay: false,
    sharedDependencies: {
        "@basic/shared": {
            singleton: true,
            eager: true
        }
    },
    environmentVariables: {
        "NETLIFY": isNetlify
    }
});

