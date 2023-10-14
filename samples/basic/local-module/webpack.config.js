// @ts-check

import { defineDevConfig } from "@workleap/webpack-configs";
import path from "node:path";
import { swcConfig } from "./swc.config.js";

export default defineDevConfig(swcConfig, {
    cache: false,
    entry: path.resolve("./src/dev/index.tsx"),
    overlay: false
});

