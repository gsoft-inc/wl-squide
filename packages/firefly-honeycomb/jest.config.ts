import type { Config } from "jest";
import { swcConfig } from "./swc.jest.ts";

const config: Config = {
    testRegex: "/tests/*/.*\\.test\\.(ts|tsx)$",
    testPathIgnorePatterns: ["/node_modules/", "/dist/"],
    testEnvironment: "jsdom",
    transformIgnorePatterns: [
        "node_modules/(?!.pnpm|memoize|mimic-function|@workleap/honeycomb)"
    ],
    transform: {
        "^.+\\.(js|ts|tsx)$": ["@swc/jest", swcConfig as Record<string, unknown>]
    },
    cacheDirectory: "./node_modules/.cache/jest",
    verbose: true
};

export default config;
