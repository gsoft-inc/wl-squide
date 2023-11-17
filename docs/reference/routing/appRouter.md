---
priority: 100
toc:
    depth: 2-3
---

# AppRouter

A component that sets up Squide federated primitives and render a React Router instance.

## Reference

```tsx
<AppRouter
    fallbackElement={<div>Loading...</div>}
    errorElement={<div>An error occured!</div>}
    waitForMsw={true}
/>
```

### Properties

- `fallbackElement`: A React element to render while the application is being bootstrapped.
- `errorElement`: A React element to render when there's an unmanaged error during the bootstrapping of the application.
- `waitForMsw`: Whether or not the application bootstrapping sequence should wait for MSW to be started before loading the data and rendering the active route.
- `onLoadPublicData`: An optional handler to load the initial public data after the **modules are registered** and **MSW is started** (if enabled). This handler is called the first time a user navigate to a [public route](../runtime/runtime-class.md#register-a-public-route). Such public data could include feature flags.
- `onLoadProtectedData`: An optional handler to load the initial protected data after the **modules are registered** and **MSW is started** (if enabled). This handler is called the first time a user navigate to a protected route (any route that has no `$visibility: public` hint). Such protected data could include a user session.
- `onCompleteRegistrations`: An optional handler to complete the [deferred registrations](../registration/registerRemoteModules.md#defer-the-registration-of-routes-or-navigation-items).
- `routerProvidersProps`: An optional object of [createBrowserRouter](https://reactrouter.com/en/main/routers/create-browser-router) options.

## Usage

### Define a loading component

```tsx host/src/Loading.tsx
export function Loading() {
    return (
        <div>Loading...</div>
    );
}
```

```tsx !#7 host/src/App.tsx
import { AppRouter } from "@squide/firefly";
import { Loading } from "./Loading.tsx";

export function App() {
    return (
        <AppRouter
            fallbackElement={<Loading />}
            errorElement={<div>An error occured!</div>}
            waitForMsw={true}
        />
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

```tsx !#9 host/src/App.tsx
import { AppRouter } from "@squide/firefly";
import { Loading } from "./Loading.tsx";
import { ErrorBoundary } from "./ErrorBoundary.tsx";

export function App() {
    return (
        <AppRouter
            fallbackElement={<Loading />}
            errorElement={<ErrorBoundary />}
            waitForMsw={true}
        />
    );
}
```

### Load public data

The handler must return a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise), and the consumer application must handle the loaded public data, as the `AppRouter` component will ignore any data resolved by the returned Promise object.

```tsx !#19,30 host/src/App.tsx
import { useState, useCallback } from "react";
import { AppRouter } from "@squide/firefly";
import { Loading } from "./Loading.tsx";
import { ErrorBoundary } from "./ErrorBoundary.tsx";
import type { FeatureFlags } from "@sample/shared";

async function fetchPublicData(setFeatureFlags: (featureFlags: FeatureFlags) => void) {
    const response = await fetch("/api/feature-flags");
    
    if (response.ok) {
        const data = await response.json();
        setFeatureFlags(data);
    }
}

export function App() {
    // The loaded data is kept in memory by this state hook of the consumer application and
    // will be used at a later time.
    const [featureFlags, setFeatureFlags] = useState<FeatureFlags>();

    const handleLoadPublicData = useCallback(() => {
        return fetchPublicData(setFeatureFlags);
    }, []);

    return (
        <AppRouter
            fallbackElement={<Loading />}
            errorElement={<ErrorBoundary />}
            waitForMsw={true}
            onLoadPublicData={handleLoadPublicData}
        />
    );
}
```

### Load protected data

The handler must return a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise), and the consumer application must handle the loaded protected data, as the `AppRouter` component will ignore any data resolved by the returned Promise object.

```tsx !#25,36 host/src/App.tsx
import { useState, useCallback } from "react";
import { AppRouter } from "@squide/firefly";
import { Loading } from "./Loading.tsx";
import { ErrorBoundary } from "./ErrorBoundary.tsx";
import type { Session } from "@sample/shared";

async function fetchProtectedData(setSession: (session: Session) => void) {
    const response = await fetch("/api/session");
    
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

    const handleLoadProtectedData = useCallback(() => {
        return fetchProtectedData(setSession);
    }, []);

    return (
        <AppRouter
            fallbackElement={<Loading />}
            errorElement={<ErrorBoundary />}
            waitForMsw={true}
            onLoadProtectedData={handleLoadProtectedData}
        />
    );
}
```

### Complete deferred registrations

For more information about deferred registrations, refer to the [registerRemoteModules](../registration/registerRemoteModules.md#defer-the-registration-of-routes-or-navigation-items) and [completeModuleRegistrations](../registration/completeModuleRegistrations.md) documentation.

```tsx !#27-30,39 host/src/App.tsx
import { useState, useCallback } from "react";
import { AppRouter } from "@squide/firefly";
import { completeModuleRegistrations } from "@squide/webpack-module-federation";
import { Loading } from "./Loading.tsx";
import { ErrorBoundary } from "./ErrorBoundary.tsx";
import type { FeatureFlags } from "@sample/shared";

async function fetchPublicData(setFeatureFlags: (featureFlags: FeatureFlags) => void) {
    const response = await fetch("/api/feature-flags");
    
    if (response.ok) {
        const data = await response.json();
        setFeatureFlags(data);
    }
}

export function App() {
    // The loaded data is kept in memory by this state hook of the consumer application and
    // will be used to complete the deferred registrations.
    const [featureFlags, setFeatureFlags] = useState<FeatureFlags>();

    const handleLoadPublicData = useCallback(() => {
        return fetchPublicData(setFeatureFlags);
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
            onCompleteRegistrations={handleCompleteRegistrations}
        />
    );
}
```

### Specify additional router options

```tsx !#11-13 host/src/App.tsx
import { AppRouter } from "@squide/firefly";
import { Loading } from "./Loading.tsx";
import { ErrorBoundary } from "./ErrorBoundary.tsx";

export function App() {
    return (
        <AppRouter
            fallbackElement={<Loading />}
            errorElement={<ErrorBoundary />}
            waitForMsw={true}
            routerProvidersProps={{
                future: { v7_startTransition: true }
            }}
        />
    );
}
```
