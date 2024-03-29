import { registerLayouts } from "@basic/shared";
import { registerShell } from "@basic/shell";
import { ConsoleLogger, FireflyRuntime, RuntimeContext, registerLocalModules } from "@squide/firefly";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { register as registerModule } from "../register.tsx";
import { App } from "./App.tsx";
import { registerDev } from "./register.tsx";
import { sessionAccessor, sessionManager } from "./session.ts";

// Create the shell runtime.
// Services, loggers and sessionAccessor could be reuse through a shared packages or faked when in isolation.
const runtime = new FireflyRuntime({
    loggers: [new ConsoleLogger()],
    sessionAccessor
});

await registerLocalModules([registerShell(sessionManager), registerLayouts(), registerDev, registerModule], runtime);

const root = createRoot(document.getElementById("root")!);

root.render(
    <StrictMode>
        <RuntimeContext.Provider value={runtime}>
            <App />
        </RuntimeContext.Provider>
    </StrictMode>
);


