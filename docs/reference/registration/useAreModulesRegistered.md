---
toc:
    depth: 2-3
order: 50
---

# useAreModulesRegistered

Force the application to re-render once all the modules are registered (but not ready).

!!!info
If your application is using the [AppRouter](../routing/appRouter.md) component, you shouldn't use this hook.
!!!

!!!info
This hook should only be used by applications that support [deferred registrations](./registerRemoteModules.md#defer-the-registration-of-routes-or-navigation-items) and should be pair with the [useAreModulesReady](./useAreModulesReady.md) hook.
!!!

## Reference

```ts
const areModulesRegistered = useAreModulesRegistered()
```

### Returns

A boolean indicating if the modules are registered.

## Usage

```tsx !#12-13 host/src/bootstrap.tsx
import { createRoot } from "react";
import { registerLocalModules, FireflyRuntime, registerRemoteModules, type RemoteDefinition } from "@squide/firefly";
import { register } from "@sample/local-module";
import { App } from "./App.tsx";

const runtime = new FireflyRuntime();

const Remotes: RemoteDefinition = [
    { name: "remote1" }
];

await registerLocalModules([register], runtime, { context });
await registerRemoteModules(Remotes, runtime);

const root = createRoot(document.getElementById("root")!);

root.render(
    <RuntimeContext.Provider value={runtime}>
        <App />
    </RuntimeContext.Provider>
);
```

```tsx !#10,17-29 host/src/App.tsx
import { useMemo, useEffect } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { completeModuleRegistrations, useAreModulesRegistered, useAreModulesReady, useRoutes, useRuntime } from "@squide/firefly";
import { fetchFeatureFlags, type FeatureFlags } from "@sample/shared";

export function App() {
    const runtime = useRuntime();

    // Re-render the application once all the modules are registered.
    const areModulesRegistered = useAreModulesRegistered();

    // Re-render the application once all the modules are registered.
    // Otherwise, the remotes routes won't be added to the router as the router will be
    // rendered before the remote modules registered their routes.
    const areModulesReady = useAreModulesReady();

    useEffect(() => {
        // Once the modules are registered, fetch the feature flags data.
        // The feature flags data cannot be fetched before the modules are registered because in development,
        // it might be one of the modules that register the MSW request handlers for the feature flags data.
        if (areModulesRegistered) {
            fetchFeatureFlags()
                .then(({ data }: { data?: FeatureFlags }) => {
                    // Execute the deferred registration functions with the feature flags data to complete
                    // the registration process.
                    completeModuleRegistrations(runtime, { featureFlags: data });
                });
        }
    }, [runtime, areModulesRegistered]);

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
