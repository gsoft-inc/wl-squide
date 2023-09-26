import { ConsoleLogger, Runtime, RuntimeContext, registerLocalModules } from "@squide/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { register } from "../register.tsx";
import { App } from "./App.tsx";
import { sessionAccessor } from "./session.ts";

// Create the shell runtime.
// Services, loggers and sessionAccessor could be reuse through a shared packages or faked when in isolation.
const runtime = new Runtime({
    loggers: [new ConsoleLogger()],
    sessionAccessor
});

// Registering the remote module as a static module because the "register" function
// is local when developing in isolation.
registerLocalModules([register], runtime);

const root = createRoot(document.getElementById("root")!);

root.render(
    <StrictMode>
        <RuntimeContext.Provider value={runtime}>
            <App />
        </RuntimeContext.Provider>
    </StrictMode>
);


