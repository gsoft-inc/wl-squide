// @ts-check

import { defineDevHostConfig } from "@squide/firefly/defineConfig.js";
import path from "node:path";
import { swcConfig } from "./swc.config.js";

export default defineDevHostConfig(swcConfig, "local1", 8080, {
    entry: path.resolve("./src/dev/index.tsx"),
    overlay: false,
    environmentVariables: {
        "NETLIFY": process.env.NETLIFY === "true"
    }
});

