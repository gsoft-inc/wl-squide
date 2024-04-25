// @ts-check

import { isNetlify } from "@basic/shared";

/**
 * A number, or a string containing a number.
 * @typedef {import("@squide/firefly-configs").RemoteDefinition}[]
 */
export const Remotes = [
    {
        name: "remote1",
        url: isNetlify ? "https://squide-basic-remote-module.netlify.app" : "http://localhost:8081"
    },
    {
        name: "remote2",
        url: isNetlify ? "https://squide-basic-another-remote-module.netlify.app" : "http://localhost:8082"
    }
];
