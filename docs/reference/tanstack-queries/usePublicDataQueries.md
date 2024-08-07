---
order: 100
toc:
    depth: 2-3
---

# usePublicDataQueries

## Reference

```ts
const results = usePublicDataQueries(queries: [])
```

### Parameters

- `queries`: An array of [QueriesOptions](https://tanstack.com/query/latest/docs/framework/react/reference/useQueries).

### Returns

An array of query results. The order returned is the same as the input order.

## Usage

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
            waitForProtectedData={false}
        >
            {({ rootRoute, registeredRoutes }) => {
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
                    />
                );
            }}
        </FireflyAppRouter>
    );
}
```
