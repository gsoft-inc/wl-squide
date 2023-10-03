import { MswPlugin } from "@squide/msw";
import { ConsoleLogger, Runtime, RuntimeContext, registerLocalModules } from "@squide/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { register } from "../register.tsx";
import { App } from "./App.tsx";
import { registerTabsPage } from "./registerTabsPage.tsx";
import { sessionAccessor } from "./session.ts";

const mswPlugin = new MswPlugin();

// Create the shell runtime.
// Services, loggers and sessionAccessor could be reuse through a shared packages or faked when in isolation.
const runtime = new Runtime({
    plugins: [mswPlugin],
    loggers: [new ConsoleLogger()],
    sessionAccessor
});

// Registering the remote module as a static module because the "register" function
// is local when developing in isolation.
registerLocalModules([register, registerTabsPage], runtime);

// Register MSW after the local modules has been registered since the request handlers
// will be registered by the modules.
if (process.env.USE_MSW) {
    import("../../mocks/browser.ts").then(({ startMsw }) => {
        startMsw(mswPlugin.requestHandlers);
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


