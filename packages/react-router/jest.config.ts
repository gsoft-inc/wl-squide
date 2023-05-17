import { type Config } from "jest";
import { config as swcConfig } from "./swc.jest.ts";

const config: Config = {
    testEnvironment: "jsdom",
    testRegex: "/tests/*/.*\\.test\\.ts?(x)$",
    testPathIgnorePatterns: ["/node_modules/", "/dist/"],
    transform: {
        "^.+\\.(js|ts|tsx)$": ["@swc/jest", swcConfig as Record<string, unknown>]
    },
    verbose: true
};

export default config;
