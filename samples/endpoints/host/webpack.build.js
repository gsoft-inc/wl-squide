// @ts-check

import { defineBuildHostConfig } from "@squide/firefly/defineConfig.js";
import { swcConfig } from "./swc.build.js";

export default defineBuildHostConfig(swcConfig, "host", {
    features: {
        i18next: true
    },
    sharedDependencies: {
        "@endpoints/shared": {
            singleton: true,
            eager: true
        }
    },
    environmentVariables: {
        "NETLIFY": process.env.NETLIFY === "true",
        "USE_MSW": process.env.USE_MSW === "true"
    }
});

