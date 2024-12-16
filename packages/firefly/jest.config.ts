import type { Config } from "jest";
import { swcConfig } from "./swc.jest.ts";

const config: Config = {
    testRegex: "/tests/*/.*\\.test\\.(ts|tsx)$",
    testPathIgnorePatterns: ["/node_modules/", "/dist/"],
    testEnvironment: "jsdom",
    transform: {
        "^.+\\.(js|ts|tsx)$": ["@swc/jest", swcConfig as Record<string, unknown>]
    },
    transformIgnorePatterns: [
        "node_modules/(?!.pnpm|memoize|mimic-function)"
    ],
    globals: {
        __webpack_share_scopes__: {
            default: {}
        }
    },
    setupFilesAfterEnv: ["<rootDir>/jest-setup.js"],
    cacheDirectory: "./node_modules/.cache/jest",
    verbose: true
};

export default config;
