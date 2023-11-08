---
priority: 100
toc:
    depth: 2-3
---

# AppRouter

A component that sets up a React Router instance with Squide [registration primitives](../default.md#registration), [routing primitives](../default.md#routing) and the Mock Service Worker [plugin](../msw/mswPlugin.md).

> The `AppRouter` component is part of the [@squide/firefly](https://www.npmjs.com/package/@squide/firefly) technology stack, which includes [React Router](https://reactrouter.com/en/main), [Webpack Module Federation](https://webpack.js.org/plugins/module-federation-plugin/) and [Mock Service Worker](https://mswjs.io/).

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

```tsx host/src/Loading.tsx
export function Loading() {
    return (
        <div>Loading...</div>
    );
}
```

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

```tsx host/src/App.tsx
import { AppRouter } from "@squide/firefly";
import { Loading } from "./Loading.tsx";
import { ErrorBoundary } from "./ErrorBoundary.tsx";

export function App() {
    return (
        <AppRouter
            fallbackElement={<Loading />}
            errorElement={<ErrorBoundary />}
            waitForMsw={process.env.USE_MSW as unknown as boolean}
        />
    );
}
```

### Load public data

```tsx !#34 host/src/App.tsx
import { useState, useCallback } from "react";
import axios from "axios";
import { AppRouter } from "@squide/firefly";
import { Loading } from "./Loading.tsx";
import { ErrorBoundary } from "./ErrorBoundary.tsx";
import type { FeatureFlags } from "@sample/shared";

function fetchPublicData(setFeatureFlags: (featureFlags: FeatureFlags) => void) {
    return axios.get("/api/feature-flags")
        .then(({ data }) => {
            const featureFlags: FeatureFlags = {
                featureA: data.featureA,
                featureB: data.featureB
            };

            setFeatureFlags(featureFlags);
        });
}

export function App() {
    const [featureFlags, setFeatureFlags] = useState<FeatureFlags>();

    const handleLoadPublicData = useCallback(() => {
        return fetchPublicData(setFeatureFlags);
    }, []);

    // Do something with "featureFlags"...

    return (
        <AppRouter
            fallbackElement={<Loading />}
            errorElement={<ErrorBoundary />}
            waitForMsw={process.env.USE_MSW as unknown as boolean}
            onLoadPublicData={handleLoadPublicData}
        />
    );
}
```

### Load protected data

```tsx !#36 host/src/App.tsx
import { useState, useCallback } from "react";
import axios from "axios";
import { AppRouter } from "@squide/firefly";
import { Loading } from "./Loading.tsx";
import { ErrorBoundary } from "./ErrorBoundary.tsx";
import type { Session } from "@sample/shared";

function fetchProtectedData(setSession: (session: Session) => void) {
    return axios.get("/api/session")
        .then(({ data }) => {
            const session: Session = {
                user: {
                    id: data.userId,
                    name: data.username
                }
            };

            setSession(session);
        });
}

export function App() {
    const [session, setSession] = useState<Session>();

    const handleLoadProtectedData = useCallback(() => {
        return fetchProtectedData(setSession);
    }, []);

    // Do something with "session"...

    return (
        <AppRouter
            fallbackElement={<Loading />}
            errorElement={<ErrorBoundary />}
            waitForMsw={process.env.USE_MSW as unknown as boolean}
            onLoadProtectedData={handleLoadProtectedData}
        />
    );
}
```

### Complete deferred registrations

```tsx !#28-32,40 host/src/App.tsx
import { useState, useCallback } from "react";
import axios from "axios";
import { AppRouter } from "@squide/firefly";
import { completeModuleRegistrations } from "@squide/webpack-module-federation";
import { Loading } from "./Loading.tsx";
import { ErrorBoundary } from "./ErrorBoundary.tsx";
import type { FeatureFlags } from "@sample/shared";

function fetchPublicData(setFeatureFlags: (featureFlags: FeatureFlags) => void) {
    return axios.get("/api/feature-flags")
        .then(({ data }) => {
            const featureFlags: FeatureFlags = {
                featureA: data.featureA,
                featureB: data.featureB
            };

            setFeatureFlags(featureFlags);
        });
}

export function App() {
    const [featureFlags, setFeatureFlags] = useState<FeatureFlags>();

    const handleLoadPublicData = useCallback(() => {
        return fetchPublicData(setFeatureFlags);
    }, []);

    const handleCompleteRegistrations = useCallback(() => {
        return completeModuleRegistrations(runtime, {
            featureFlags
        });
    }, [runtime, featureFlags]);

    return (
        <AppRouter
            fallbackElement={<Loading />}
            errorElement={<ErrorBoundary />}
            waitForMsw={process.env.USE_MSW as unknown as boolean}
            onLoadPublicData={handleLoadPublicData}
            onCompleteRegistrations={handleCompleteRegistrations}
        />
    );
}
```
