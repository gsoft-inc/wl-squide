// @ts-check

/**
 * @typedef {import("@squide/firefly-webpack-configs").RemoteDefinition[]}
 */
export const Remotes = [
    {
        name: "remote1",
        url: process.env.NETLIFY === "true" ? "https://squide-endpoints-remote-module.netlify.app" : "http://localhost:8081"
    }
];
