// @ts-check

import { defineBuildHostConfig, defineBuildRemoteModuleConfig } from "@squide/firefly/defineConfig.js";
import path from "node:path";
import { swcConfig } from "./swc.build.js";

let config;

if (!process.env.ISOLATED) {
    config = defineBuildRemoteModuleConfig(swcConfig, "remote1", {
        features: {
            msw: true
        },
        sharedDependencies: {
            "@endpoints/shared": {
                singleton: true
            }
        },
        environmentVariables: {
            "NETLIFY": process.env.NETLIFY === "true",
            "USE_MSW": process.env.USE_MSW === "true"
        }
    });
} else {
    config = defineBuildHostConfig(swcConfig, "remote1", {
        entry: path.resolve("./src/dev/index.tsx"),
        environmentVariables: {
            "NETLIFY": process.env.NETLIFY === "true",
            "USE_MSW": process.env.USE_MSW === "true"
        }
    });
}

export default config;
