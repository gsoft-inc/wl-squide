import { registerLocalModule } from "@sample/local-module";
import { isNetlify, type AppContext } from "@sample/shared";
import { registerShell } from "@sample/shell";
import { MswPlugin } from "@squide/msw";
import { ConsoleLogger, Runtime, RuntimeContext, registerLocalModules } from "@squide/react-router";
import { registerRemoteModules, type RemoteDefinition } from "@squide/webpack-module-federation";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.tsx";
import { registerHost } from "./register.tsx";
import { sessionAccessor, sessionManager } from "./session.ts";

const Remotes: RemoteDefinition[] = [
    {
        name: "remote1",
        url: isNetlify ? "https://squide-remote-module.netlify.app" : "http://localhost:8081"
    },
    {
        name: "remote2",
        url: isNetlify ? "https://squide-another-remote-module.netlify.app" : "http://localhost:8082"
    }
];

// Add a plugin to support Mock Service Worker for a federated application.
// The plugin will help collect the request handlers from every module.
const mswPlugin = new MswPlugin();

const runtime = new Runtime({
    loggers: [new ConsoleLogger()],
    plugins: [mswPlugin],
    sessionAccessor
});

const context: AppContext = {
    name: "Sample app"
};

registerLocalModules([registerShell(sessionManager), registerHost, registerLocalModule], runtime, { context });

registerRemoteModules(Remotes, runtime, { context }).then(() => {
    if (process.env.USE_MSW) {
        import("../mocks/browser.ts").then(({ startMsw }) => {
            // Will start MSW with the request handlers provided by every module.
            startMsw(mswPlugin.requestHandlers);

            // Indicate to resources that are dependent on MSW
            // that the service has been started.
            mswPlugin.setAsStarted();
        });
    }
});

const root = createRoot(document.getElementById("root")!);

root.render(
    <StrictMode>
        <RuntimeContext.Provider value={runtime}>
            <App />
        </RuntimeContext.Provider>
    </StrictMode>
);
