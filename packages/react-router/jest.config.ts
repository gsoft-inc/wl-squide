import type { Config } from "jest";
import { pathsToModuleNameMapper } from "ts-jest";
import { swcConfig } from "./swc.jest.ts";
import { compilerOptions } from "./tsconfig.json";

const config: Config = {
    testEnvironment: "jsdom",
    transformIgnorePatterns: [
        "node_modules/(?!.pnpm|memoize|mimic-function)"
    ],
    transform: {
        "^.+\\.(js|ts|tsx)$": ["@swc/jest", swcConfig as Record<string, unknown>]
    },
    moduleNameMapper: {
        ...pathsToModuleNameMapper(compilerOptions.paths, {
            prefix: "<rootDir>"
        })
    },
    cacheDirectory: "./node_modules/.cache/jest"
};

export default config;
