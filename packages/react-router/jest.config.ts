import { type Config } from "jest";
import { config as swcConfig } from "./swc.jest.ts";

const config: Config = {
    // rootDir: "../../../",
    testEnvironment: "jsdom",
    testRegex: "/tests/*/.*\\.test\\.ts?(x)$",
    testPathIgnorePatterns: ["/node_modules/", "/dist/"],
    transform: {
        "^.+\\.(js|ts|tsx)$": ["@swc/jest", swcConfig as Record<string, unknown>]
    },
    moduleNameMapper: {
        "@squide/core(.*)$": "../../../packages/core/src/$1"
    },
    verbose: true
};

export default config;
