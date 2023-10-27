import type { Config } from "jest";
import { swcConfig } from "./swc.jest.ts";

const config: Config = {
    transform: {
        "^.+\\.(js|ts)$": ["@swc/jest", swcConfig as Record<string, unknown>]
    }
};

export default config;
