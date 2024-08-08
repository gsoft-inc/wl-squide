---
order: 110
toc:
    depth: 2-3
---

# AppRouter

A component that sets up Squide federated primitives with a [React Router](https://reactrouter.com/en/main) instance.

## Reference

```tsx
<AppRouter waitForMsw={boolean} waitForPublicData={boolean} waitForProtectedData={boolean}>
    {({ rootRoute, registeredRoutes, routerProviderProps }) => ( ... )}
</AppRouter>
```

### Properties

- `waitForMsw`: A `boolean` value indicating whether or not Squide should delay the rendering of the requested page until the [MSW](https://mswjs.io/) request handlers are registered.
- `waitForPublicData`: An optional `boolean` value indicating whether or not Squide should delay the rendering of the requested page until the **public** data is ready. The default value is `false`.
- `waitForProtectedData`: An optional `boolean` value indicating whether or not Squide should delay the rendering of the requested page until the **protected** data is ready. The default value is `false`.
- `children`: A render function defining a [RouterProvider](https://reactrouter.com/en/main/routers/router-provider) component with `rootRoute`, `registeredRoutes` and `routerProviderProps`.

## Usage

### Define a router provider

```tsx !#17-30 host/src/AppRouter.tsx
import { useIsBootstrapping, AppRouter as FireflyAppRouter } from "@squide/firefly";
import { RouterProvider, createBrowserRouter, Outlet } from "react-router-dom";

function BootstrappingRoute() {
    if (useIsBootstrapping()) {
        return <div>Loading...</div>;
    }

    return <Outlet />;
}

export function AppRouter() {
    return (
        <FireflyAppRouter waitForMsw={false}>
            {({ rootRoute, registeredRoutes, routerProviderProps }) => {
                return (
                    <RouterProvider
                        router={createBrowserRouter([
                            {
                                element: rootRoute,
                                children: [
                                    {
                                        element: <BootstrappingRoute />,
                                        children: registeredRoutes
                                    }
                                ]
                            }
                        ])}
                        {...routerProviderProps}
                    />
                );
            }}
        </FireflyAppRouter>
    );
}
```

### Define a root error boundary

In this context, an error boundary is a React Router [errorElement](https://reactrouter.com/en/main/route/error-element).

```tsx host/src/RootErrorBoundary.tsx
import { useRouteError } from "react-router-dom";

export function RootErrorBoundary() {
    const error = useRouteError();

    return (
        <div>
            <h2>Unmanaged error</h2>
            <p>An unmanaged error occurred and the application is broken, try refreshing your browser.</p>
        </div>
    );
}
```

```tsx !#25 host/src/AppRouter.tsx
import { useIsBootstrapping, AppRouter as FireflyAppRouter } from "@squide/firefly";
import { RouterProvider, createBrowserRouter, Outlet } from "react-router-dom";
import { RootErrorBoundary } from "./RootErrorBoundary.tsx";

function BootstrappingRoute() {
    if (useIsBootstrapping()) {
        return <div>Loading...</div>;
    }

    return <Outlet />;
}

export function AppRouter() {
    return (
        <FireflyAppRouter waitForMsw={false}>
            {({ rootRoute, registeredRoutes, routerProviderProps }) => {
                return (
                    <RouterProvider
                        router={createBrowserRouter([
                            {
                                element: rootRoute,
                                children: [
                                    {
                                        element: <BootstrappingRoute />,
                                        errorElement: <RootErrorBoundary />,
                                        children: registeredRoutes
                                    }
                                ]
                            }
                        ])}
                        {...routerProviderProps}
                    />
                );
            }}
        </FireflyAppRouter>
    );
}
```

### Delay rendering until MSW is ready

```tsx !#14 host/src/AppRouter.tsx
import { useIsBootstrapping, AppRouter as FireflyAppRouter } from "@squide/firefly";
import { RouterProvider, createBrowserRouter, Outlet } from "react-router-dom";

function BootstrappingRoute() {
    if (useIsBootstrapping()) {
        return <div>Loading...</div>;
    }

    return <Outlet />;
}

export function AppRouter() {
    return (
        <FireflyAppRouter waitForMsw={true}>
            {({ rootRoute, registeredRoutes, routerProviderProps }) => {
                return (
                    <RouterProvider
                        router={createBrowserRouter([
                            {
                                element: rootRoute,
                                children: [
                                    {
                                        element: <BootstrappingRoute />,
                                        children: registeredRoutes
                                    }
                                ]
                            }
                        ])}
                        {...routerProviderProps}
                    />
                );
            }}
        </FireflyAppRouter>
    );
}
```

### Delay rendering until the public data is ready

```tsx !#24 host/src/AppRouter.tsx
import { useIsBootstrapping, usePublicDataQueries, AppRouter as FireflyAppRouter } from "@squide/firefly";
import { RouterProvider, createBrowserRouter, Outlet } from "react-router-dom";
import { FeatureFlagsContext } from "@sample/shared";
import { getFeatureFlagsQuery } from "./getFeatureFlagsQuery.ts";

function BootstrappingRoute() {
    const [featureFlags] = usePublicDataQueries([getFeatureFlagsQuery]);

    if (useIsBootstrapping()) {
        return <div>Loading...</div>;
    }

    return (
        <FeatureFlagsContext.Provider value={featureFlags}>
            <Outlet />
        </FeatureFlagsContext.Provider>
    );
}

export function AppRouter() {
    return (
        <FireflyAppRouter 
            waitForMsw={true}
            waitForPublicData={true}
        >
            {({ rootRoute, registeredRoutes, routerProviderProps }) => {
                return (
                    <RouterProvider
                        router={createBrowserRouter([
                            {
                                element: rootRoute,
                                children: [
                                    {
                                        element: <BootstrappingRoute />,
                                        children: registeredRoutes
                                    }
                                ]
                            }
                        ])}
                        {...routerProviderProps}
                    />
                );
            }}
        </FireflyAppRouter>
    );
}
```

### Delay rendering until the protected data is ready

```tsx !#27 host/src/AppRouter.tsx
import { useIsBootstrapping, useProtectedDataQueries, AppRouter as FireflyAppRouter } from "@squide/firefly";
import { RouterProvider, createBrowserRouter, Outlet } from "react-router-dom";
import { SessionContext, isApiError } from "@sample/shared";
import { getSessionQuery } from "./getSessionQuery.ts";

function BootstrappingRoute() {
    const [session] = useProtectedDataQueries(
        [getSessionQuery],
        error => isApiError(error) && error.status === 401
    );

    if (useIsBootstrapping()) {
        return <div>Loading...</div>;
    }

    return (
        <SessionContext.Provider value={session}>
            <Outlet />
        </SessionContext.Provider>
    );
}

export function AppRouter() {
    return (
        <FireflyAppRouter 
            waitForMsw={true}
            waitForProtectedData={true}
        >
            {({ rootRoute, registeredRoutes, routerProviderProps }) => {
                return (
                    <RouterProvider
                        router={createBrowserRouter([
                            {
                                element: rootRoute,
                                children: [
                                    {
                                        element: <BootstrappingRoute />,
                                        children: registeredRoutes
                                    }
                                ]
                            }
                        ])}
                        {...routerProviderProps}
                    />
                );
            }}
        </FireflyAppRouter>
    );
}
```
