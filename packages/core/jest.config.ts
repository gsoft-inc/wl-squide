import type { Config } from "jest";
import { swcConfig } from "./swc.jest.ts";

const config: Config = {
    transform: {
        "^.+\\.(js|ts)$": ["@swc/jest", swcConfig as Record<string, unknown>]
    },
    cacheDirectory: "./node_modules/.cache/jest"
};

export default config;
