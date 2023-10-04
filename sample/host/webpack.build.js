// @ts-check

import { defineBuildHostConfig } from "@squide/webpack-module-federation/defineConfig.js";
import { swcConfig } from "./swc.build.js";

// The trailing / is very important, otherwise paths will not be resolved correctly.
const publicPath = process.env.NETLIFY === "true" ? "https://squide-host.netlify.app/" : "http://localhost:8080/";

export default defineBuildHostConfig(swcConfig, "host", publicPath, {
    sharedDependencies: {
        "@tanstack/react-query": {
            singleton: true,
            eager: true
        },
        "@sample/shared": {
            singleton: true,
            eager: true
        },
        "axios": {
            singleton: true,
            eager: true
        }
    },
    environmentVariables: {
        "NETLIFY": process.env.NETLIFY === "true"
    }
});

