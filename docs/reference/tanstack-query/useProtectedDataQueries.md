---
order: 90
toc:
    depth: 2-3
---

# useProtectedDataQueries

Execute the specified [TanStack queries](https://tanstack.com/query/latest/docs/framework/react/reference/useQueries) when the modules are ready, the active route is protected and, when applicable, [MSW](https://mswjs.io/) is ready.

!!!warning
Only use this hook for protected global data that is fetched by your application `AppRouter` component, do not use this hook in product feature components.
!!!

## Reference

```ts
const results = useProtectedDataQueries(queries: [], isUnauthorizedError: (error) => boolean)
```

### Parameters

- `queries`: An array of [QueriesOptions](https://tanstack.com/query/latest/docs/framework/react/reference/useQueries).
- `isUnauthorizedError`: A function that returns a `boolean` value indicating whether or not the provided error is a `401` status code.

### Returns

An array of query response data. The order returned is the same as the input order.

### Throws

If an unmanaged error occur while performing any of the fetch requests, a [GlobalDataQueriesError](./isGlobalDataQueriesError.md#globaldataquerieserror) will be thrown.

## Usage

### Define queries

```tsx !#18-43,62 host/src/AppRouter.tsx
import { useProtectedDataQueries, useIsBootstrapping, AppRouter as FireflyAppRouter } from "@squide/firefly";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ApiError, SessionContext, SubscriptionContext, type Session, type Subscription } from "@sample/shared";

async function fetchJson(url: string) {
    const response = await fetch(url);

    if (!response.ok) {
        throw new ApiError(response.status, response.statusText);
    }

    const data = await response.json();

    return data;
}

function BootstrappingRoute() {
    const [session, subscription] = useProtectedDataQueries([
        {
            queryKey: ["/api/session"],
            queryFn: async () => {
                const data = await fetchJson("/api/session");

                const result: Session = {
                    user: {
                        id: data.userId,
                        name: data.username,
                        preferredLanguage: data.preferredLanguage
                    }
                };

                return result;
            }
        },
        {
            queryKey: ["/api/subscription"],
            queryFn: async () => {
                const data = await fetchJson("/api/subscription");

                return data as Subscription;
            }
        }
    ], error => isApiError(error) && error.status === 401);

    if (useIsBootstrapping()) {
        return <div>Loading...</div>;
    }

    return (
        <SessionContext.Provider value={session}>
            <SubscriptionContext.Provider value={subscription}>
                <Outlet />
            </SubscriptionContext.Provider>
        </SessionContext.Provider>
    );
}

export function AppRouter() {
    return (
        <FireflyAppRouter 
            waitForMsw
            waitForProtectedData
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

Errors from the `useIsProtectedDataQueries` hook are typically unmanaged and should be handled by an error boundary. In this context, an error boundary is a React Router [errorElement](https://reactrouter.com/en/main/route/error-element).

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

```tsx !#58 host/src/AppRouter.tsx
import { useProtectedDataQueries, useIsBootstrapping, AppRouter as FireflyAppRouter } from "@squide/firefly";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ApiError, SessionContext, type Session } from "@sample/shared";
import { RootErrorBoundary } from "./RootErrorBoundary.tsx";

function BootstrappingRoute() {
    const [session] = useProtectedDataQueries([
        {
            queryKey: ["/api/session"],
            queryFn: async () => {
                const response = await fetch("/api/session");

                if (!response.ok) {
                    throw new ApiError(response.status, response.statusText);
                }

                const data = await response.json();

                const result: Session = {
                    user: {
                        id: data.userId,
                        name: data.username,
                        preferredLanguage: data.preferredLanguage
                    }
                };

                return result;
            }
        }
    ], error => isApiError(error) && error.status === 401);

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
            waitForMsw
            waitForProtectedData
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

### Handle 401 response

Unauthorized requests are a special case that shouldn't be handled by an error boundary, as this would cause an **infinite loop** with the application's authentication boundary.

To address this, when the server returns a `401` status code, the `useProtectedDataQueries` hook instructs Squide to immediately render the page, triggering the authentication boundary, that will eventually redirect the user to a login page.

Since Squide handles everything behind the scenes, there is nothing specific for you to do as a consumer, except to register an `AuthenticationBoundary` component and provide an `isUnauthorizedError` handler to the `useProtectedDataQueries` hook.

```tsx host/src/AuthenticationBoundary.tsx
import { useContext } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { SessionContext } from "@sample/shared";

export function AuthenticationBoundary() {
    const session = useContext(SessionContext);

    if (session) {
        return <Outlet />;
    }

    return <Navigate to="/login" />;
}
```

```tsx !#8 host/src/registerHost.tsx
import { ManagedRoutes, type ModuleRegisterFunction, type FireflyRuntime } from "@squide/firefly";
import { AuthenticationBoundary } from "./AuthenticationBoundary.tsx";

export function registerHost() {
    const register: ModuleRegisterFunction<FireflyRuntime> = runtime => {
        runtime.registerRoute({
            // Pathless route to declare an authenticated boundary.
            element: <AuthenticationBoundary />,
            children: [
                ManagedRoutes
            ]
        }, {
            hoist: true
        });
    };

    return register;
}
```

!!!info
The `registerHost` function is registered as a [local module](../registration/registerLocalModules.md) of the host application.
!!!

```tsx !#29 host/src/AppRouter.tsx
import { useProtectedDataQueries, useIsBootstrapping, AppRouter as FireflyAppRouter } from "@squide/firefly";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ApiError, SessionContext, type Session } from "@sample/shared";

function BootstrappingRoute() {
    const [session] = useProtectedDataQueries([
        {
            queryKey: ["/api/session"],
            queryFn: async () => {
                const response = await fetch("/api/session");

                if (!response.ok) {
                    throw new ApiError(response.status, response.statusText);
                }

                const data = await response.json();

                const result: Session = {
                    user: {
                        id: data.userId,
                        name: data.username,
                        preferredLanguage: data.preferredLanguage
                    }
                };

                return result;
            }
        }
    ], error => isApiError(error) && error.status === 401);

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
            waitForMsw
            waitForProtectedData
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


