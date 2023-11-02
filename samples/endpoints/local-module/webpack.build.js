// @ts-check

import { defineBuildHostConfig } from "@squide/webpack-module-federation/defineConfig.js";
import path from "node:path";
import { swcConfig } from "./swc.build.js";

export default defineBuildHostConfig(swcConfig, "local1", {
    entry: path.resolve("./src/dev/index.tsx"),
    environmentVariables: {
        "ISOLATED": process.env.ISOLATED === "true",
        "USE_MSW": process.env.USE_MSW === "true"
    }
});
