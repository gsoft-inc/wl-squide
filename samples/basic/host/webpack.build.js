// @ts-check

import { isNetlify } from "@basic/shared";
import { defineBuildHostConfig } from "@squide/firefly-webpack-configs";
import { Remotes } from "./remotes.js";
import { swcConfig } from "./swc.build.js";
import { getSharedDependencies } from "./webpack.common.js";

export default defineBuildHostConfig(swcConfig, "host", Remotes, {
    sharedDependencies: getSharedDependencies(),
    environmentVariables: {
        "NETLIFY": isNetlify
    }
});

