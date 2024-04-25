// @ts-check

import { isNetlify } from "@endpoints/shared";

/**
 * A number, or a string containing a number.
 * @typedef {import("@squide/firefly-configs").RemoteDefinition}[]
 */
export const Remotes = [
    {
        name: "remote1",
        url: isNetlify ? "https://squide-endpoints-remote-module.netlify.app" : "http://localhost:8081"
    }
];
