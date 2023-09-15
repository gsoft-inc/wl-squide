import { ConsoleLogger, Runtime, RuntimeContext, registerLocalModules } from "@squide/react-router";
import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.tsx";
import { register } from "./register.tsx";
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
            <Suspense fallback={<div>Loading...</div>}>
                <App />
            </Suspense>
        </RuntimeContext.Provider>
    </StrictMode>
);


