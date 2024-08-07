// @ts-check

import { defineDevHostConfig } from "@squide/firefly-webpack-configs";
import path from "node:path";
import { swcConfig } from "./swc.dev.js";
import { features, getSharedDependencies } from "./webpack.common.js";

export default defineDevHostConfig(swcConfig, 8080, [], {
    overlay: false,
    entry: path.resolve("./src/dev/index.tsx"),
    features,
    sharedDependencies: getSharedDependencies(true),
    environmentVariables: {
        "ISOLATED": process.env.ISOLATED === "true",
        "USE_MSW": process.env.USE_MSW === "true"
    }
});

