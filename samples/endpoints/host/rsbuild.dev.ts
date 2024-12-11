import { defineDevHostConfig } from "@squide/firefly-rsbuild-configs";
import { Remotes } from "./remotes.ts";
import { features, getSharedDependencies } from "./rsbuild.common.ts";

export default defineDevHostConfig(8080, Remotes, {
    overlay: false,
    features,
    sharedDependencies: getSharedDependencies(),
    environmentVariables: {
        "NETLIFY": process.env.NETLIFY === "true",
        "USE_MSW": process.env.USE_MSW === "true"
    }
});
