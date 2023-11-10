import { registerLocalModule } from "@basic/local-module";
import { isNetlify, registerLayouts, type AppContext } from "@basic/shared";
import { registerShell } from "@basic/shell";
import { ConsoleLogger, Runtime, RuntimeContext, registerLocalModules, registerRemoteModules, type RemoteDefinition } from "@squide/firefly";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.tsx";
import { registerHost } from "./register.tsx";
import { sessionAccessor, sessionManager } from "./session.ts";

const Remotes: RemoteDefinition[] = [
    {
        name: "remote1",
        url: isNetlify ? "https://squide-basic-remote-module.netlify.app" : "http://localhost:8081"
    },
    {
        name: "remote2",
        url: isNetlify ? "https://squide-basic-another-remote-module.netlify.app" : "http://localhost:8082"
    }
];

const runtime = new Runtime({
    loggers: [new ConsoleLogger()],
    sessionAccessor
});

const context: AppContext = {
    name: "Test app"
};

await registerLocalModules([registerShell(sessionManager, { host: "@basic/host" }), registerLayouts({ host: "@basic/host" }), registerHost, registerLocalModule], runtime, { context });

await registerRemoteModules(Remotes, runtime, { context });

const root = createRoot(document.getElementById("root")!);

root.render(
    <StrictMode>
        <RuntimeContext.Provider value={runtime}>
            <App />
        </RuntimeContext.Provider>
    </StrictMode>
);
