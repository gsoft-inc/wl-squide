---
order: 950
label: Migrate to firefly v9.3.0
---

# Migrate to firefly v9.3.0

Before going through this guide, make sure you followed the migration to firefly v9 guide.

Introduce a new primitive to ease the bootstrapping of a Squide application and 

Before:

```tsx bootstrap.tsx
import { createRoot } from "react-dom/client";
import { ConsoleLogger, RuntimeContext, FireflyRuntime, registerRemoteModules, registerLocalModules, type RemoteDefinition } from "@squide/firefly";
import { register as registerMyLocalModule } from "@getting-started/local-module";
import { App } from "./App.tsx";
import { registerHost } from "./register.tsx";

// Define the remote modules.
const Remotes: RemoteDefinition[] = [
    { name: "remote1" }
];

// Create the shell runtime.
const runtime = new FireflyRuntime({
    loggers: [x => new ConsoleLogger(x)]
});

// Register the remote module.
await registerRemoteModules(Remotes, runtime);

// Register the local module.
await registerLocalModules([registerHost, registerMyLocalModule], runtime);

const root = createRoot(document.getElementById("root")!);

root.render(
    <RuntimeContext.Provider value={runtime}>
        <App />
    </RuntimeContext.Provider>
);
```

After:

```tsx bootstrap.tsx
import { createRoot } from "react-dom/client";
import { ConsoleLogger, RuntimeContext, FireflyRuntime, bootstrap, type RemoteDefinition } from "@squide/firefly";
import { register as registerMyLocalModule } from "@getting-started/local-module";
import { App } from "./App.tsx";
import { registerHost } from "./register.tsx";

// Define the remote modules.
const Remotes: RemoteDefinition[] = [
    { name: "remote1" }
];

// Create the shell runtime.
const runtime = new FireflyRuntime({
    loggers: [x => new ConsoleLogger(x)]
});

// Register the modules.
await bootstrap(runtime, {
    localModules: [registerHost, registerMyLocalModule],
    remotes: Remotes
});

const root = createRoot(document.getElementById("root")!);

root.render(
    <RuntimeContext.Provider value={runtime}>
        <App />
    </RuntimeContext.Provider>
);
```

### MSW

Before:

```tsx bootstrap.tsx
import { createRoot } from "react-dom/client";
import { ConsoleLogger, RuntimeContext, FireflyRuntime, registerRemoteModules, type RemoteDefinition } from "@squide/firefly";
import { App } from "./App.tsx";
import { registerHost } from "./register.tsx";

const Remotes: RemoteDefinition[] = [
    { name: "remote1" }
];

const runtime = new FireflyRuntime({
    useMsw: !!process.env.USE_MSW,
    loggers: [x => new ConsoleLogger(x)]
});

await registerLocalModules([registerHost], runtime);

await registerRemoteModules(Remotes, runtime);

// Once both register functions are done, we can safely assume that all the request handlers has been registered.
if (runtime.isMswEnabled) {
    // Files that includes an import to the "msw" package are included dynamically to prevent adding
    // unused MSW stuff to the application bundles.
    const startMsw = (await import("../mocks/browser.ts")).startMsw;

    // Will start MSW with the modules request handlers.
    startMsw(runtime.requestHandlers)
        .then(() => {
            // Indicate that MSW is ready and the routes can now be safely rendered.
            setMswAsReady();
        })
        .catch((error: unknown) => {
            consoleLogger.debug("[host-app] An error occured while starting MSW.", error);
        });
}

const root = createRoot(document.getElementById("root")!);

root.render(
    <RuntimeContext.Provider value={runtime}>
        <App />
    </RuntimeContext.Provider>
);
```

After:

```tsx bootstrap.tsx
import { createRoot } from "react-dom/client";
import { ConsoleLogger, RuntimeContext, FireflyRuntime, registerRemoteModules, type RemoteDefinition } from "@squide/firefly";
import { App } from "./App.tsx";
import { registerHost } from "./register.tsx";

const Remotes: RemoteDefinition[] = [
    { name: "remote1" }
];

const runtime = new FireflyRuntime({
    useMsw: !!process.env.USE_MSW,
    loggers: [x => new ConsoleLogger(x)]
});

await bootstrap(runtime, {
    localModules: [registerHost],
    remote: Remotes,
    startMsw: async () => {
        // Files that includes an import to the "msw" package are included dynamically to prevent adding
        // unused MSW stuff to the code bundles.
        (await import("../mocks/browser.ts")).startMsw(runtime.requestHandlers);
    }
});

const root = createRoot(document.getElementById("root")!);

root.render(
    <RuntimeContext.Provider value={runtime}>
        <App />
    </RuntimeContext.Provider>
);
```
