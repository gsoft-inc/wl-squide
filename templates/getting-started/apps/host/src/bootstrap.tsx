import { register as registerMyLocalModule } from "@getting-started/local-module";
import { ConsoleLogger, FireflyRuntime, RuntimeContext, registerLocalModules, registerRemoteModules, type RemoteDefinition } from "@squide/firefly";
import { createRoot } from "react-dom/client";
import { App } from "./App.tsx";
import { registerHost } from "./register.tsx";

// Define the remote modules.
const Remotes: RemoteDefinition[] = [
    { name: "remote1" }
];

// Create the shell runtime.
const runtime = new FireflyRuntime({
    loggers: [new ConsoleLogger()]
});

// Register the remote module.
await registerRemoteModules(Remotes, runtime);

// Register the local module.
registerLocalModules([registerHost, registerMyLocalModule], runtime);

const root = createRoot(document.getElementById("root")!);

root.render(
    <RuntimeContext.Provider value={runtime}>
        <App />
    </RuntimeContext.Provider>
);
