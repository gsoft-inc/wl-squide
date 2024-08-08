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

## Usage

### Define a query

```tsx !#18-43,62 host/src/AppRouter.tsx
import { usePublicDataQueries, useIsBootstrapping, AppRouter as FireflyAppRouter } from "@squide/firefly";
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

### Define multiple queries

### Handle fetch errors

### Handle 401 response

-> AuthenticationBoundary
