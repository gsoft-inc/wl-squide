import { ConsoleLogger, Runtime, RuntimeContext, registerStaticModules } from "@squide/react-router";
import { StrictMode, Suspense } from "react";

import { App } from "./App.tsx";
import type { AppContext } from "shared";
import { createRoot } from "react-dom/client";
import { register } from "static-module";

const runtime = new Runtime({
    loggers: [new ConsoleLogger()]
});

const context: AppContext = {
    name: "Test app"
};

registerStaticModules([register], runtime, { context });

const root = createRoot(document.getElementById("root")!);

root.render(
    <StrictMode>
        <RuntimeContext.Provider value={runtime}>
            <Suspense fallback="Loading...">
                <App />
            </Suspense>
        </RuntimeContext.Provider>
    </StrictMode>
);
