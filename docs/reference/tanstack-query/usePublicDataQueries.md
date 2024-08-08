---
order: 100
toc:
    depth: 2-3
---

# usePublicDataQueries

Execute the specified [TanStack queries](https://tanstack.com/query/latest/docs/framework/react/reference/useQueries) when the modules are ready and, when applicable, [MSW](https://mswjs.io/) is ready.

!!!warning
Only use this hook for public global data that is fetched by your application `AppRouter` component, do not use this hook in product feature components.
!!!

## Reference

```ts
const results = usePublicDataQueries(queries: [])
```

### Parameters

- `queries`: An array of [QueriesOptions](https://tanstack.com/query/latest/docs/framework/react/reference/useQueries).

### Returns

An array of query response data. The order returned is the same as the input order.

### Throws

If an unmanaged error occur while performing any of the fetch requests, a [GlobalDataQueriesError](./isGlobalDataQueriesError.md#globaldataquerieserror) will be thrown.

## Usage

### Define queries

```tsx !#6-21,38 host/src/AppRouter.tsx
import { usePublicDataQueries, useIsBootstrapping, AppRouter as FireflyAppRouter } from "@squide/firefly";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ApiError, FeatureFlagsContext, type FeatureFlags } from "@sample/shared";

function BootstrappingRoute() {
    const [featureFlags] = usePublicDataQueries([
        {
            queryKey: ["/api/feature-flags"],
            queryFn: async () => {
                const response = await fetch("/api/feature-flags");

                if (!response.ok) {
                    throw new ApiError(response.status, response.statusText);
                }

                const data = await response.json();

                return data as FeatureFlags;
            }
        }
    ]);

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
            waitForMsw
            waitForPublicData
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

### Handle fetch errors

Errors from the `useIsPublicDataQueries` hook are typically unmanaged and should be handled by an error boundary. In this context, an error boundary is a React Router [errorElement](https://reactrouter.com/en/main/route/error-element).

```tsx !#10 host/src/RootErrorBoundary.tsx
import { useLogger, isGlobalDataQueriesError } from "@squide/firefly";
import { useLocation, useRouteError } from "react-router-dom";

export function RootErrorBoundary() {
    const error = useRouteError() as Error;
    const location = useLocation();
    const logger = useLogger();

    useEffect(() => {
        if (isGlobalDataQueriesError(error)) {
            logger.error(`[shell] An unmanaged error occurred while rendering the route with path ${location.pathname}`, error.message, error.errors);
        }
    }, [location.pathname, error, logger]);

    return (
        <div>
            <h2>Unmanaged error</h2>
            <p>An unmanaged error occurred and the application is broken, try refreshing your browser.</p>
        </div>
    );
}
```

```tsx !#50 host/src/AppRouter.tsx
import { usePublicDataQueries, useIsBootstrapping, AppRouter as FireflyAppRouter } from "@squide/firefly";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ApiError, FeatureFlagsContext, type FeatureFlags } from "@sample/shared";
import { RootErrorBoundary } from "./RootErrorBoundary.tsx";

function BootstrappingRoute() {
    const [featureFlags] = usePublicDataQueries([
        {
            queryKey: ["/api/feature-flags"],
            queryFn: async () => {
                const response = await fetch("/api/feature-flags");

                if (!response.ok) {
                    throw new ApiError(response.status, response.statusText);
                }

                const data = await response.json();

                return data as FeatureFlags;
            }
        }
    ]);

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
            waitForMsw
            waitForPublicData
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
                                        errorElement: <RootErrorBoundary />
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
