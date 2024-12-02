import type { Config } from "jest";
import { swcConfig } from "./swc.jest.ts";

const config: Config = {
    testEnvironment: "jsdom",
    transformIgnorePatterns: [
        "node_modules/(?!.pnpm|memoize|mimic-function)"
    ],
    transform: {
        "^.+\\.(js|ts|tsx)$": ["@swc/jest", swcConfig as Record<string, unknown>]
    },
    cacheDirectory: "./node_modules/.cache/jest"
};

export default config;
