import type { RemoteDefinition } from "@squide/firefly-rsbuild-configs";

export const Remotes: RemoteDefinition[] = [
    {
        name: "remote1",
        url: process.env.NETLIFY === "true" ? "https://squide-basic-remote-module.netlify.app" : "http://localhost:8084"
    },
    {
        name: "remote2",
        url: process.env.NETLIFY === "true" ? "https://squide-basic-another-remote-module.netlify.app" : "http://localhost:8085"
    }
];
