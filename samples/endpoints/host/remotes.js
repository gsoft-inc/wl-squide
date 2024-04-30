// @ts-check

import { isNetlify } from "@endpoints/shared";

/**
 * @typedef {import("@squide/firefly-webpack-configs").RemoteDefinition}[]
 */
export const Remotes = [
    {
        name: "remote1",
        url: isNetlify ? "https://squide-endpoints-remote-module.netlify.app" : "http://localhost:8081"
    }
];
