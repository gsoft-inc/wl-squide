---
priority: 100
toc:
    depth: 2-3
---

# AppRouter

A component that sets up and orchestrate Squide federated primitives with a React Router instance.

## Reference

```tsx
<AppRouter fallbackElement={} errorElement={} waitForMsw={}>
    {(routes: [], routerProviderOptoons: {}) => ( ... )}
</AppRouter>
```

### Properties

- `fallbackElement`: A React element to render while the application is being bootstrapped.
- `errorElement`: A React element to render when there's an unmanaged error during the bootstrapping of the application.
- `waitForMsw`: Whether or not the application bootstrapping sequence should wait for MSW to be started before loading the data and rendering the active route.
- `onLoadPublicData`: An optional handler to load the initial public data after the **modules are registered** and **MSW is started** (if enabled). This handler is called the first time a user navigate to a [public route](../runtime/runtime-class.md#register-a-public-route). Such public data could include feature flags.
    - `signal`: An [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/signal) to cancel the previous HTTP request when the `onLoadPublicData` handler is called twice due to the `AppRouter` being re-rendered.
- `onLoadProtectedData`: An optional handler to load the initial protected data after the **modules are registered** and **MSW is started** (if enabled). This handler is called the first time a user navigate to a protected route (any route that has no `$visibility: public` hint). Such protected data could include a user session.
    - `signal`: An [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/signal) to cancel the previous HTTP request when the `onLoadPublicData` handler is called twice due to the `AppRouter` being re-rendered.
- `isPublicDataLoaded`: Whether or not the initial public data has been loaded.
- `isProtectedDataLoaded`: Whether or not the initial protected data has been loaded.
- `onCompleteRegistrations`: An optional handler to complete the [deferred registrations](../registration/registerRemoteModules.md#defer-the-registration-of-routes-or-navigation-items).
- `children`: A render function to define a React Router [RouterProvider](https://reactrouter.com/en/main/routers/router-provider) component with the registered routes.

## Usage

### Define a router provider

```tsx !#11-13 host/src/App.tsx
import { AppRouter } from "@squide/firefly";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

export function App() {
    return (
        <AppRouter
            fallbackElement={<div>Loading...</div>}
            errorElement={<div>An error occured!</div>}
            waitForMsw={true}
        >
            {(routes, providerProps) => (
                <RouterProvider router={createBrowserRouter(routes)} {...providerProps} />
            )}
        </AppRouter>
    );
}
```

### Define a loading component

```tsx host/src/Loading.tsx
export function Loading() {
    return (
        <div>Loading...</div>
    );
}
```

```tsx !#8 host/src/App.tsx
import { AppRouter } from "@squide/firefly";
import { Loading } from "./Loading.tsx";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

export function App() {
    return (
        <AppRouter
            fallbackElement={<Loading />}
            errorElement={<div>An error occured!</div>}
            waitForMsw={true}
        >
            {(routes, providerProps) => (
                <RouterProvider router={createBrowserRouter(routes)} {...providerProps} />
            )}
        </AppRouter>
    );
}
```

### Define an error component

An error component receives the current `error` as a prop. 

```tsx host/src/ErrorBoundary.tsx
export function ErrorBoundary({ error }: { error?: Error }) {
    return (
        <div>
            <h2>Unmanaged error</h2>
            <p>An unmanaged error occurred while bootstrapping the application.</p>
            <p>{error?.message}</p>
            <p><code>{error?.stack}</code></p>
        </div>
    );
}
```

```tsx !#10 host/src/App.tsx
import { AppRouter } from "@squide/firefly";
import { Loading } from "./Loading.tsx";
import { ErrorBoundary } from "./ErrorBoundary.tsx";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

export function App() {
    return (
        <AppRouter
            fallbackElement={<Loading />}
            errorElement={<ErrorBoundary />}
            waitForMsw={true}
        >
            {(routes, providerProps) => (
                <RouterProvider router={createBrowserRouter(routes)} {...providerProps} />
            )}
        </AppRouter>
    );
}
```

### Load public data

The handler must return a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise), and the consumer application must handle the loaded public data, as the `AppRouter` component will ignore any data resolved by the returned `Promise` object.

The `isPublicDataLoaded` property should also be provided to indicate whether or not the initial public data loading is completed.

```tsx !#10,23,25-27,34-35 host/src/App.tsx
import { useState, useCallback } from "react";
import { AppRouter } from "@squide/firefly";
import { Loading } from "./Loading.tsx";
import { ErrorBoundary } from "./ErrorBoundary.tsx";
import type { FeatureFlags } from "@sample/shared";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

async function fetchPublicData(setFeatureFlags: (featureFlags: FeatureFlags) => void, signal: AbortSignal) {
    const response = await fetch("/api/feature-flags", {
        signal
    });
    
    if (response.ok) {
        const data = await response.json();

        setFeatureFlags(data);
    }
}

export function App() {
    // The loaded data is kept in memory by this state hook of the consumer application and
    // will be used at a later time.
    const [featureFlags, setFeatureFlags] = useState<FeatureFlags>();

    const handleLoadPublicData = useCallback((signal: AbortSignal) => {
        return fetchPublicData(setFeatureFlags, signal);
    }, []);

    return (
        <AppRouter
            fallbackElement={<Loading />}
            errorElement={<ErrorBoundary />}
            waitForMsw={true}
            onLoadPublicData={handleLoadPublicData}
            isPublicDataLoaded={!!featureFlags}
        >
            {(routes, providerProps) => (
                <RouterProvider router={createBrowserRouter(routes)} {...providerProps} />
            )}
        </AppRouter>
    );
}
```

!!!warning
Don't forget to forward the [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/signal) to the HTTP client initiating the public data GET request.
!!!

### Load protected data

The handler must return a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise), and the consumer application must handle the loaded protected data, as the `AppRouter` component will ignore any data resolved by the returned `Promise` object.

The `isProtectedDataLoaded` property should also be provided to indicate whether or not the initial protected data loading is completed.

```tsx !#10,28,30-32,39-40 host/src/App.tsx
import { useState, useCallback } from "react";
import { AppRouter } from "@squide/firefly";
import { Loading } from "./Loading.tsx";
import { ErrorBoundary } from "./ErrorBoundary.tsx";
import type { Session } from "@sample/shared";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

async function fetchProtectedData(setSession: (session: Session) => void, signal: AbortSignal) {
    const response = await fetch("/api/session"), {
        signal
    });
    
    if (response.ok) {
        const data = await response.json();

        setSession({
            user: {
                id: data.userId,
                name: data.username
            }
        });
    }
}

export function App() {
    // The loaded data is kept in memory by this state hook of the consumer application and
    // will be used at a later time.
    const [session, setSession] = useState<Session>();

    const handleLoadProtectedData = useCallback((signal: AbortSignal) => {
        return fetchProtectedData(setSession, signal);
    }, []);

    return (
        <AppRouter
            fallbackElement={<Loading />}
            errorElement={<ErrorBoundary />}
            waitForMsw={true}
            onLoadProtectedData={handleLoadProtectedData}
            isProtectedDataLoaded={!!session}
        >
            {(routes, providerProps) => (
                <RouterProvider router={createBrowserRouter(routes)} {...providerProps} />
            )}
        </AppRouter>
    );
}
```

!!!warning
Don't forget to forward the [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/signal) to the HTTP client initiating the public data GET request.
!!!

### Complete deferred registrations

For more information about deferred registrations, refer to the [registerRemoteModules](../registration/registerRemoteModules.md#defer-the-registration-of-routes-or-navigation-items) and [completeModuleRegistrations](../registration/completeModuleRegistrations.md) documentation.

```tsx !#32-34,44 host/src/App.tsx
import { useState, useCallback } from "react";
import { AppRouter } from "@squide/firefly";
import { completeModuleRegistrations } from "@squide/webpack-module-federation";
import { Loading } from "./Loading.tsx";
import { ErrorBoundary } from "./ErrorBoundary.tsx";
import type { FeatureFlags } from "@sample/shared";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

async function fetchPublicData(setFeatureFlags: (featureFlags: FeatureFlags) => void, signal: AbortSignal) {
    const response = await fetch("/api/feature-flags", {
        signal
    });
    
    if (response.ok) {
        const data = await response.json();
        
        setFeatureFlags(data);
    }
}

export function App() {
    // The loaded data is kept in memory by this state hook of the consumer application and
    // will be used to complete the deferred registrations.
    const [featureFlags, setFeatureFlags] = useState<FeatureFlags>();

    const handleLoadPublicData = useCallback((signal: AbortSignal) => {
        return fetchPublicData(setFeatureFlags, signal);
    }, []);

    const handleCompleteRegistrations = useCallback(() => {
        // The consumer application takes care of providing the public data to the deferred registrations.
        return completeModuleRegistrations(runtime, {
            featureFlags
        });
    }, [runtime, featureFlags]);

    return (
        <AppRouter
            fallbackElement={<Loading />}
            errorElement={<ErrorBoundary />}
            waitForMsw={true}
            onLoadPublicData={handleLoadPublicData}
            isPublicDataLoaded={!!featureFlags}
            onCompleteRegistrations={handleCompleteRegistrations}
        >
            {(routes, providerProps) => (
                <RouterProvider router={createBrowserRouter(routes)} {...providerProps} />
            )}
        </AppRouter>
    );
}
```
