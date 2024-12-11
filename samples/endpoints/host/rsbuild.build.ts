import { defineBuildHostConfig } from "@squide/firefly-rsbuild-configs";
import { Remotes } from "./remotes.ts";
import { features, getSharedDependencies } from "./rsbuild.common.ts";

export default defineBuildHostConfig(Remotes, {
    features,
    sharedDependencies: getSharedDependencies(),
    environmentVariables: {
        "NETLIFY": process.env.NETLIFY === "true",
        "USE_MSW": process.env.USE_MSW === "true"
    }
});

