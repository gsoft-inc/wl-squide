import { register as registerLocalModule } from "@sample/local-module";
import { isNetlify, type AppContext } from "@sample/shared";
import { MswPlugin } from "@squide/msw";
import { ConsoleLogger, Runtime, RuntimeContext, registerLocalModules } from "@squide/react-router";
import { registerRemoteModules, type RemoteDefinition } from "@squide/webpack-module-federation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.tsx";
import { sessionAccessor } from "./session.ts";

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

// Creates a React Query client.
// This client will be shared between the host application and the remote modules.
// It's primary purpose is to keep fresh data in cache but also to serve as a global
// state management solution for the federated application. It works for most global state
// values because with React Query the global state values are synched with the server
// data, which is our single source of truth.
const queryClient = new QueryClient();

const context: AppContext = {
    name: "Test app"
};

registerLocalModules([registerLocalModule], runtime, { context });

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
            <QueryClientProvider client={queryClient}>
                <App />
                <ReactQueryDevtools initialIsOpen={false} />
            </QueryClientProvider>
        </RuntimeContext.Provider>
    </StrictMode>
);
