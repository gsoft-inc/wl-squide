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

## Usage

### Define a query

```tsx !#6-21,38 host/src/AppRouter.tsx
import { usePublicDataQueries, useIsBootstrapping, AppRouter as FireflyAppRouter } from "@squide/firefly";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ApiError, FeatureFlagsContext, type FeatureFlags } from "@sample/shared";

function BootstrappingRoute() {
    const [featureFlags] = usePublicDataQueries([
        {
            queryKey: ["/api/feature-flags"],
            queryFn: async () => {
                const response = await fetch(url);

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

### Define multiple queries

### Handle fetch errors
