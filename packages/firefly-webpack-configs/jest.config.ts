import type { Config } from "jest";
import path from "node:path";
import { swcConfig } from "./swc.jest.ts";

const config: Config = {
    testRegex: "/tests/*/.*\\.test\\.(ts|tsx)$",
    testPathIgnorePatterns: ["/node_modules/", "/dist/"],
    testEnvironment: "jsdom",
    transformIgnorePatterns: [
        // Must exclude @workleap/webpack-configs from the transform ignore files
        // because it's an ESM only project which must be processed by SWC.
        // The pattern is optimized for PNPM, for more info view:
        // - https://jestjs.io/docs/configuration#transformignorepatterns-arraystring
        // - https://jestjs.io/docs/ecmascript-modules
        `${path.join(
            __dirname,
            "../.."
        )}/node_modules/.pnpm/(?!(@workleap\\+webpack-configs)@)`
    ],
    transform: {
        "^.+\\.(js|ts)$": ["@swc/jest", swcConfig as Record<string, unknown>]
    },
    cacheDirectory: "./node_modules/.cache/jest",
    verbose: true
};

export default config;
