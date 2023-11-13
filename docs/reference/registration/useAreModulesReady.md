---
toc:
    depth: 2-3
---

# useAreModulesReady

Force the application to re-render once the registration process has been completed for all the modules. Without this hook, the page is rendered with an empty router as it happens before the remote modules registered their routes and navigation items.

!!!info
If your application is using the [AppRouter](../routing/appRouter.md) component, you shouldn't use this hook.
!!!

!!!info
If your application supports [deferred registrations](./registerRemoteModules.md#defer-the-registration-of-routes-or-navigation-items), make sure to pair this hook with the [useAreModulesRegistered](./useAreModulesRegistered.md) hook. 
!!!

## Reference

```ts
const areModulesReady = useAreModulesReady(options?: { interval? })
```

### Parameters

- `options`: An optional object literal of options:
    - `interval`: The interval in milliseconds at which the hook is validating if the registration process is completed.

### Returns

A boolean indicating if the registration process is completed.

## Usage

```tsx !#11 host/src/bootstrap.tsx
import { createRoot } from "react";
import { FireflyRuntime, registerRemoteModules, type RemoteDefinition } from "@squide/firefly";
import { App } from "./App.tsx";

const runtime = new FireflyRuntime();

const Remotes: RemoteDefinition = [
    { name: "remote1", url: "http://localhost:8081" }
];

await registerRemoteModules(Remotes, runtime);

const root = createRoot(document.getElementById("root")!);

root.render(
    <RuntimeContext.Provider value={runtime}>
        <App />
    </RuntimeContext.Provider>
);
```

```tsx !#9,17-19 host/src/App.tsx
import { useMemo } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { useAreModulesReady, useRoutes } from "@squide/firefly";

export function App() {
    // Re-render the application once all the modules are registered.
    // Otherwise, the remotes routes won't be added to the router as the router will be
    // rendered before the remote modules registered their routes.
    const areModulesReady = useAreModulesReady();

    const routes = useRoutes();

    const router = useMemo(() => {
        return createBrowserRouter(routes);
    }, [routes]);

    if (!areModulesReady) {
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
