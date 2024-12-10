import type { Config } from "jest";
import { swcConfig } from "./swc.jest.ts";

const config: Config = {
    testRegex: "/tests/*/.*\\.test\\.(ts|tsx)$",
    testPathIgnorePatterns: ["/node_modules/", "/dist/"],
    testEnvironment: "jsdom",
    transform: {
        "^.+\\.(ts|tsx)$": ["@swc/jest", swcConfig as Record<string, unknown>]
    },
    globals: {
        __webpack_share_scopes__: {
            default: {}
        }
    },
    cacheDirectory: "./node_modules/.cache/jest",
    verbose: true
};

export default config;
