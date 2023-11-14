import { registerLayouts } from "@endpoints/shared";
import { registerShell } from "@endpoints/shell";
import { ConsoleLogger, FireflyRuntime, RuntimeContext, registerLocalModules, setMswAsStarted } from "@squide/firefly";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { registerLocalModule } from "../register.tsx";
import { App } from "./App.tsx";
import { registerDev } from "./register.tsx";
import { sessionAccessor, sessionManager } from "./session.ts";

// Create the shell runtime.
// Services, loggers and sessionAccessor could be reuse through a shared packages or faked when in isolation.
const runtime = new FireflyRuntime({
    loggers: [new ConsoleLogger()],
    sessionAccessor
});

await registerLocalModules([registerShell(sessionManager), registerLayouts(), registerDev, registerLocalModule], runtime);

// Register MSW after the local modules has been registered since the request handlers
// will be registered by the modules.
if (process.env.USE_MSW) {
    // Files including an import to the "msw" package are included dynamically to prevent adding
    // MSW stuff to the bundled when it's not used.
    const startMsw = (await import("../../mocks/browser.ts")).startMsw;

    startMsw(runtime.requestHandlers);
    setMswAsStarted();
}

const root = createRoot(document.getElementById("root")!);

root.render(
    <StrictMode>
        <RuntimeContext.Provider value={runtime}>
            <App />
        </RuntimeContext.Provider>
    </StrictMode>
);


