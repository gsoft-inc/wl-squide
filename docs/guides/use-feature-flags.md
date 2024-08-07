---
order: 840
---

# Use feature flags

!!!warning
Before going forward with this guide, make sure that you completed the [Setup Mock Service Worker](./setup-msw.md) and [Fetch initial data](./fetch-initial-data.md) guides.
!!!

To continuously deliver value to our customers, Workleap has adopted a feature flags system that allows to activate or deactivate functionalities without requiring code deployment. While "in-page" feature flags are straightforward to implement for a Squide application, feature flags that conditionally register pages or navigation items requires a more advanced [deferred registration](../reference/registration/registerRemoteModules.md#defer-the-registration-of-routes-or-navigation-items) mechanism.

## Add an endpoint

First, define a MSW request handler that returns the feature flags:

```ts mocks/handlers.ts
import { HttpResponse, http, type HttpHandler } from "msw";

export const requestHandlers: HttpHandler[] = [
    http.get("/api/feature-flags", () => {
        return HttpResponse.json({
            featureA: true,
            featureB: true
        });
    })
];
```

Then, register the request handler using the module registration function:

```tsx !#18,20 src/register.tsx
import type { ModuleRegisterFunction, FireflyRuntime } from "@squide/firefly";
import { Page } from "./Page.tsx";

export const register: ModuleRegisterFunction<FireflyRuntime> = async runtime => {
    runtime.registerRoute({
        path: "/page",
        element: <Page />
    });

    runtime.registerNavigationItem({
        $label: "Page",
        to: "/page"
    });

    if (runtime.isMswEnabled) {
        // Files that includes an import to the "msw" package are included dynamically to prevent adding
        // unused MSW stuff to the application bundles.
        const requestHandlers = (await import("../mocks/handlers.ts")).requestHandlers;

        runtime.registerRequestHandlers(requestHandlers);
    }
}
```

### Create a shared context

Then, in a shared project, create a `FeatureFlagsContext`:

```ts shared/src/featureFlagsContext.ts
import { createContext, useContext } from "react";

export interface FeatureFlags {
    featureA: boolean;
    featureB: boolean;
}

export const FeatureFlagsContext = createContext(FeatureFlags | undefined);

export function useFeatureFlags() {
    return useContext(FeatureFlags);
}
```

!!!info
Ensure that the shared project is configured as a [shared dependency](./add-a-shared-dependency.md).
!!!

## Fetch the feature flags

Finally, open the host application code and update the `App` component to utilize the `AppRouter` component's `onLoadPublicData` handler to fetch the feature flags data:

```tsx !#24-26,29,31-32 host/src/App.tsx
import { useState, useCallback } from "react";
import { AppRouter } from "@squide/firefly";
import { FeatureFlagsContext, type FeatureFlags } from "@sample/shared";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

async function fetchPublicData(setFeatureFlags: (featureFlags: FeatureFlags) => void, signal: AbortSignal) {
    const response = await fetch("/api/feature-flags", {
        signal
    });

    const data = await response.json();

    const featureFlags: FeatureFlags = {
        featureA: data.featureA,
        featureB: data.featureB
    };

    setFeatureFlags(featureFlags);
}

export function App() {
    const [featureFlags, setFeatureFlags] = useState<FeatureFlags>();

    const handleLoadPublicData = useCallback((signal: AbortSignal) => {
        return fetchPublicData(setFeatureFlags, signal);
    }, []);

    return (
        <FeatureFlagsContext.Provider value={featureFlags}>
            <AppRouter
                onLoadPublicData={handleLoadPublicData}
                isPublicDataLoaded={!!featureFlags}
                fallbackElement={<div>Loading...</div>}
                errorElement={<div>An error occured!</div>}
                waitForMsw={true}
            >
                {(routes, providerProps) => (
                    <RouterProvider router={createBrowserRouter(routes)} {...providerProps} />
                )}
            </AppRouter>
        <FeatureFlagsContext.Provider />
    );
}
```

## Conditionally render a page section

Now, let's use the `featureA` flag from `FeatureFlagsContext` to conditionally render a section of the `Page` component:

```tsx src/Page.tsx
import { useFeatureFlags } from "@sample/shared";

export function Page() {
    const { featureFlags } = useFeatureFlags();

    return (
        <>
            {featureFlags?.featureA ? <div>This section is only rendered when "featureA" is activated.</div>}
            <div>Hello from Page!</div>
        </>
    );
}
```

In the previous code sample, the section of the `Page` component will only be rendered if `featureA` is activated.

## Conditionally register a route

Now, conditionally registering a route and it's navigation items based on a feature flag is more complex since the default registration mechanism is executed before the application has bootstrapped, meaning that the feature flags has not been fetched yet from the server.

To address this, Squide offers an alternate [deferred registration](../reference/registration/registerRemoteModules.md#defer-the-registration-of-routes-or-navigation-items) mechanism in two-phases:

1. The first phase allows modules to register their routes and navigation items that are not dependent on initial data.

2. The second phase enables modules to register routes and navigation items that are dependent on initial data. We refer to this second phase as **deferred registrations**.

To defer a registration to the second phase, a module registration function can **return an anonymous function**. Once the modules are registered and the [TBD](../reference/registration/completeRemoteModuleRegistrations.md) function is called, the deferred registration functions will be executed.

First, let's update the module registration function to return an anonymous function that will receive the feature flags:

```ts shared/src/deferredData.ts
import { FeatureFlags } from "./featureFlagsContext.ts";

export interface DeferredRegistrationData {
    featureFlags?: FeatureFlags;
}
```

```tsx !#15-28 src/register.tsx
import type { ModuleRegisterFunction, FireflyRuntime } from "@squide/firefly";
import type { DeferredRegistrationData } from "@sample/shared";
import { Page } from "./Page.tsx";

export const register: ModuleRegisterFunction<FireflyRuntime, unknown, DeferredRegistrationData> = async runtime => {
    if (runtime.isMswEnabled) {
        // Files that includes an import to the "msw" package are included dynamically to prevent adding
        // unused MSW stuff to the application bundles.
        const requestHandlers = (await import("../mocks/handlers.ts")).requestHandlers;

        runtime.registerRequestHandlers(requestHandlers);
    }

    // Return a deferred registration function.
    return ({ featureFlags } = {}) => {
        // Only register the "Page" route and navigation items if "featureB" is activated.
        if (featureFlags?.featureB) {
            runtime.registerRoute({
                path: "/page",
                element: <Page />
            });

            runtime.registerNavigationItem({
                $label: "Page",
                to: "/page"
            });
        }
    };
}
```

Finally, open the host application code again and update the `App` component to utilize the `AppRouter` component's `onCompleteRegistrations` handler to [TBD](../reference/registration/completeRemoteModuleRegistrations.md) with the feature flags:

```tsx !#27-32,39 host/src/App.tsx
import { useState, useCallback } from "react";
import { AppRouter, useRuntime, completeModuleRegistrations } from "@squide/firefly";
import { FeatureFlagsContext, type FeatureFlags } from "@sample/shared";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

async function fetchPublicData(setFeatureFlags: (featureFlags: FeatureFlags) => void, signal: AbortSignal) {
    const response = await fetch("/api/feature-flags");
    const data = await response.json();

    const featureFlags: FeatureFlags = {
        featureA: data.featureA,
        featureB: data.featureB
    };

    setFeatureFlags(featureFlags);
}

export function App() {
    const [featureFlags, setFeatureFlags] = useState<FeatureFlags>();

    const runtime = useRuntime();

    const handleLoadPublicData = useCallback((signal: AbortSignal) => {
        return fetchPublicData(setFeatureFlags, signal);
    }, []);

    const handleCompleteRegistrations = useCallback(() => {
        // Provide the retrieved feature flags when completing the registration of the deferred registration.
        return completeModuleRegistrations(runtime, {
            featureFlags
        });
    }, [runtime, featureFlags]);

    return (
        <FeatureFlagsContext.Provider value={featureFlags}>
            <AppRouter
                onLoadPublicData={handleLoadPublicData}
                isPublicDataLoaded={!!featureFlags}
                onCompleteRegistrations={handleCompleteRegistrations}
                fallbackElement={<div>Loading...</div>}
                errorElement={<div>An error occured!</div>}
                waitForMsw={true}
            >
                {(routes, providerProps) => (
                    <RouterProvider router={createBrowserRouter(routes)} {...providerProps} />
                )}
            </AppRouter>
        <FeatureFlagsContext.Provider />
    );
}
```

## Try it :rocket:

Start the application using the `dev` and navigate to the `/page` page. The page should render with the conditonal section. Now, disable the `featureA` flag in the endpoint and refresh the page. You shouldn't see the conditonal section anymore. Finally, disable the `featureB` flag in the endpoint and refresh the page. The page shouldn't be available anymore.

If you are experiencing issues with this section of the guide:

- Open the [DevTools](https://developer.chrome.com/docs/devtools/) console. You'll find a log entry for each registration that occurs (including MSW request handlers) and error messages if something went wrong.
- Refer to a working example on [GitHub](https://github.com/gsoft-inc/wl-squide/tree/main/samples/endpoints).
- Refer to the [troubleshooting](../troubleshooting.md) page.
