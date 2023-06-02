import { ConsoleLogger, Runtime, RuntimeContext, registerLocalModules } from "@squide/react-router";
import { StrictMode, Suspense } from "react";

import { App } from "./App.tsx";
import { type AppContext, isNetlify } from "@sample/shared";
import { createRoot } from "react-dom/client";
import { register } from "@sample/local-module";
import { type RemoteDefinition, registerRemoteModules } from "@squide/webpack-module-federation";
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

registerRemoteModules(Remotes, runtime, { context });

registerLocalModules([register], runtime, { context });

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
