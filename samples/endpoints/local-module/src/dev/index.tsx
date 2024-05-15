import { createI18NextPlugin } from "@endpoints/i18next";
import { registerShell } from "@endpoints/shell";
import { ConsoleLogger, FireflyRuntime, RuntimeContext, registerLocalModules, setMswAsReady } from "@squide/firefly";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { registerLocalModule } from "../register.tsx";
import { App } from "./App.tsx";
import { registerDev } from "./register.tsx";

const consoleLogger = new ConsoleLogger();

// Create the shell runtime.
// Services, loggers and sessionAccessor could be reuse through a shared packages or faked when in isolation.
const runtime = new FireflyRuntime({
    useMsw: !!process.env.USE_MSW,
    plugins: [createI18NextPlugin()],
    loggers: [consoleLogger]
});

await registerLocalModules([registerShell(), registerDev, registerLocalModule], runtime);

// Register MSW after the local modules has been registered since the request handlers
// will be registered by the modules.
if (runtime.isMswEnabled) {
    // Files including an import to the "msw" package are included dynamically to prevent adding
    // MSW stuff to the bundled when it's not used.
    const startMsw = (await import("../../mocks/browser.ts")).startMsw;

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


