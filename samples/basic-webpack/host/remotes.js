// @ts-check

/**
 * @typedef {import("@squide/firefly-webpack-configs").RemoteDefinition[]}
 */
export const Remotes = [
    {
        name: "remote1",
        url: process.env.NETLIFY === "true" ? "https://squide-basic-remote-module.netlify.app" : "http://localhost:8087"
    },
    {
        name: "remote2",
        url: process.env.NETLIFY === "true" ? "https://squide-basic-another-remote-module.netlify.app" : "http://localhost:8088"
    }
];
