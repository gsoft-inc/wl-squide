import { registerShell } from "@sample/shell";
import { ConsoleLogger, Runtime, RuntimeContext, registerLocalModules } from "@squide/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { registerLocalModule } from "../register.tsx";
import { App } from "./App.tsx";
import { registerDev } from "./register.tsx";
import { onLogin, onLogout, sessionAccessor } from "./session.ts";

// Create the shell runtime.
// Services, loggers and sessionAccessor could be reuse through a shared packages or faked when in isolation.
const runtime = new Runtime({
    loggers: [new ConsoleLogger()],
    sessionAccessor
});

registerLocalModules([registerShell(onLogin, onLogout), registerDev, registerLocalModule], runtime);

const root = createRoot(document.getElementById("root")!);

root.render(
    <StrictMode>
        <RuntimeContext.Provider value={runtime}>
            <App />
        </RuntimeContext.Provider>
    </StrictMode>
);


