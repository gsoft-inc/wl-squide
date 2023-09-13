import { register as registerLocalModule } from "@sample/local-module";
import { isNetlify, type AppContext } from "@sample/shared";
import { ConsoleLogger, Runtime, RuntimeContext, registerLocalModules } from "@squide/react-router";
import { registerRemoteModules, type RemoteDefinition } from "@squide/webpack-module-federation";
import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.tsx";
import { registerDistributedTabsPage } from "./distributedTabs/register.tsx";
import { sessionAccessor } from "./session.ts";

const Remotes: RemoteDefinition[] = [
    {
        name: "remote1",
        url: isNetlify ? "https://squide-remote-module.netlify.app" : "http://localhost:8081"
    }
];

const runtime = new Runtime({
    loggers: [new ConsoleLogger()],
    sessionAccessor
});

const context: AppContext = {
    name: "Test app"
};

registerLocalModules([registerDistributedTabsPage, registerLocalModule], runtime, { context });

registerRemoteModules(Remotes, runtime, { context });

const root = createRoot(document.getElementById("root")!);

root.render(
    <StrictMode>
        <RuntimeContext.Provider value={runtime}>
            <Suspense fallback={<div>Loading...</div>}>
                <App />
            </Suspense>
        </RuntimeContext.Provider>
    </StrictMode>
);
