import { createI18NextPlugin } from "@endpoints/i18next";
import { registerLocalModule } from "@endpoints/local-module";
import { registerShell } from "@endpoints/shell";
import { ConsoleLogger, FireflyRuntime, RuntimeContext, registerLocalModules, registerRemoteModules, setMswAsReady } from "@squide/firefly";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Remotes } from "../remotes.js";
import { App } from "./App.tsx";
import { registerHost } from "./register.tsx";

const consoleLogger = new ConsoleLogger();

const runtime = new FireflyRuntime({
    useMsw: !!process.env.USE_MSW,
    plugins: [createI18NextPlugin()],
    loggers: [consoleLogger]
});

await registerLocalModules([registerShell({ host: "@endpoints/host" }), registerHost, registerLocalModule], runtime);

await registerRemoteModules(Remotes, runtime);

if (runtime.isMswEnabled) {
    // Files that includes an import to the "msw" package are included dynamically to prevent adding
    // unused MSW stuff to the code bundles.
    const startMsw = (await import("../mocks/browser.ts")).startMsw;

    // Will start MSW with the request handlers provided by every module.
    startMsw(runtime.requestHandlers)
        .then(() => {
            // Indicate to resources that are dependent on MSW that the service has been started.
            setMswAsReady();
        })
        .catch((error: unknown) => {
            consoleLogger.debug("[host-app] An error occured while starting MSW.", error);
        });
}

const root = createRoot(document.getElementById("root")!);

root.render(
    <StrictMode>
        <RuntimeContext.Provider value={runtime}>
            <App />
        </RuntimeContext.Provider>
    </StrictMode>
);
