import type { Config } from "jest";
import path from "node:path";
import { pathsToModuleNameMapper } from "ts-jest";
import { swcConfig } from "./swc.jest.ts";
import { compilerOptions } from "./tsconfig.json";

const config: Config = {
    testEnvironment: "node",
    transformIgnorePatterns: [
        // Must exclude @workleap/webpack-configs from the transform ignore files
        // because it's an ESM only project which must be processed by SWC.
        // The pattern is optimized for PNPM, for more info view: https://jestjs.io/docs/configuration#transformignorepatterns-arraystring.
        `${path.join(
            __dirname,
            "../.."
        )}/node_modules/.pnpm/(?!(@workleap\\+webpack-configs)@)`
    ],
    transform: {
        // Must add the ".js" file extension because the files from @workleap/webpack-configs
        // are ESM only and therefore must be processed by SWC.
        "^.+\\.(js|ts)$": ["@swc/jest", swcConfig as Record<string, unknown>]
    },
    moduleNameMapper: {
        ...pathsToModuleNameMapper(compilerOptions.paths, {
            prefix: "<rootDir>"
        })
    }
};

export default config;
