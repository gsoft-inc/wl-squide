import type { Config } from "jest";
import { swcConfig } from "./swc.jest.ts";

const config: Config = {
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
    cacheDirectory: "./node_modules/.cache/jest"
};

export default config;
