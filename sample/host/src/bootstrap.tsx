import { ConsoleLogger, Runtime, RuntimeContext, registerLocalModules } from "@squide/react-router";
import { StrictMode, Suspense } from "react";

import { App } from "./App.tsx";
import type { AppContext } from "@sample/shared";
import { createRoot } from "react-dom/client";
import { register } from "@sample/local-module";
import { registerRemoteModules } from "@squide/webpack-module-federation";
import { sessionAccessor } from "./session.ts";

const runtime = new Runtime({
    loggers: [new ConsoleLogger()],
    sessionAccessor
});

const context: AppContext = {
    name: "Test app"
};

registerRemoteModules([{ name: "remote1", url: "http://localhost:8081" }], runtime, { context });

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
