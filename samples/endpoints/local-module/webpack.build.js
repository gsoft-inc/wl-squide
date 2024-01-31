// @ts-check

import { defineBuildHostConfig } from "@squide/firefly-configs";
import path from "node:path";
import { swcConfig } from "./swc.build.js";
import { features, getSharedDependencies } from "./webpack.common.js";

export default defineBuildHostConfig(swcConfig, "local1", {
    entry: path.resolve("./src/dev/index.tsx"),
    features,
    sharedDependencies: getSharedDependencies(true),
    environmentVariables: {
        "ISOLATED": process.env.ISOLATED === "true",
        "USE_MSW": process.env.USE_MSW === "true"
    }
});

