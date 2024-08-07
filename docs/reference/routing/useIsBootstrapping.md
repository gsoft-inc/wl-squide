---
toc:
    depth: 2-3
---

# useIsBootstrapping

## Reference

```ts
const isBootstrapping = useIsBootstrapping();
```

### Parameters

None

### Returns

## Usage

```tsx host/src/AppRouter.tsx
import { useIsBootstrapping, RouterProvider, AppRouter as FireflyAppRouter } from "@squide/firefly";
import { createBrowserRouter, Outlet } from "react-router-dom";

function BootstrappingRoute() {
    if (useIsBootstrapping()) {
        return <div>Loading...</div>;
    }

    return <Outlet />;
}

export function AppRouter() {
    return (
        <FireflyAppRouter waitForMsw={false} waitForPublicData={false} waitForProtectedData={false}>
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
