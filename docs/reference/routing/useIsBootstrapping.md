---
toc:
    depth: 2-3
---

# useIsBootstrapping

Indicate whether or not the application is currently being bootstrap, e.g. registering the modules, registering the deferred registrations, getting [MSW](https://mswjs.io/) ready, fetching the global data, etc..

## Reference

```ts
const isBootstrapping = useIsBootstrapping();
```

### Parameters

None

### Returns

A `boolean` value indicating whether or not the application is bootstrapping.

## Usage

```tsx host/src/AppRouter.tsx
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
