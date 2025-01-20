import { loadEnv } from "@rsbuild/core";
import { defineBuildHostConfig } from "@squide/firefly-rsbuild-configs";
import path from "node:path";
import { Remotes } from "./remotes.ts";
import { features, getSharedDependencies } from "./rsbuild.common.ts";

const { parsed } = loadEnv({
    cwd: path.resolve("../../..")
});

export default defineBuildHostConfig(Remotes, {
    features,
    sharedDependencies: getSharedDependencies(),
    environmentVariables: {
        "NETLIFY": process.env.NETLIFY === "true",
        "USE_MSW": process.env.USE_MSW === "true",
        ...parsed
    }
});

