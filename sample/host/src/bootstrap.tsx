import { register as registerLocalModule } from "@sample/local-module";
import { isNetlify, type AppContext } from "@sample/shared";
import { MswPlugin } from "@squide/msw";
import { ConsoleLogger, Runtime, RuntimeContext, registerLocalModules } from "@squide/react-router";
import { registerRemoteModules, type RemoteDefinition } from "@squide/webpack-module-federation";
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

const mswPlugin = new MswPlugin();

const runtime = new Runtime({
    plugins: [mswPlugin],
    loggers: [new ConsoleLogger()],
    sessionAccessor
});

const context: AppContext = {
    name: "Test app"
};

registerLocalModules([registerLocalModule], runtime, { context });

registerRemoteModules(Remotes, runtime, { context }).then(() => {
    if (process.env.USE_MSW) {
        import("../mocks/browser.ts").then(({ startMsw }) => {
            startMsw(mswPlugin.requestHandlers);
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
