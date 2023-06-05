# useAreRemotesReady

Force the application to re-render once the remote modules are registered. Without this hook, the page is rendered with an empty router as it happens before the remote modules registered their routes and navigation items.

!!!info
Only use this hook if your application loads remote modules.
!!!

## Reference

```ts
const isReady = useAreRemotesReady(options?: { interval? })
```

### Parameters

- `options`: An optional object literal of options.
    - `interval`: The interval in milliseconds at which the hook is validating if the registration process is completed.

### Returns

A boolean indicating if the registration is completed.

## Usage

```tsx !#12 host/src/bootstrap.tsx
import { createRoot } from "react";
import { Runtime } from "@squide/react-router";
import { registerRemoteModules, type RemoteDefinition } from "@squide/webpack-module-federation";
import { App } from "./App.tsx";

const runtime = new Runtime();

const Remotes: RemoteDefinition = [
    { name: "remote1", url: "http://localhost:8081" }
];

registerRemoteModules(Remotes, runtime);

const root = createRoot(document.getElementById("root")!);

root.render(
    <RuntimeContext.Provider value={runtime}>
        <App />
    </RuntimeContext.Provider>
);
```

```tsx !#10,18-20 host/src/App.tsx
import { useMemo } from "react";
import { useAreRemotesReady } from "@squide/webpack-module-federation";
import { useRoutes } from "@squide/react-router";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

export function App() {
    // Re-render the application once all the remotes are registered.
    // Otherwise, the remotes routes won't be added to the router as the router will be
    // rendered before the remote modules registered their routes.
    const isReady = useAreRemotesReady();

    const routes = useRoutes();

    const router = useMemo(() => {
        return createBrowserRouter(routes);
    }, [routes]);

    if (!isReady) {
        return <div>Loading...</div>;
    }

    return (
        <RouterProvider
            router={router}
            fallbackElement={<div>Loading...</div>}
        />
    );
}
```
