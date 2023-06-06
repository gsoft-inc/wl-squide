# useHoistedRoutes

Allow modules to register pages outside of the host application's pages boundaries. Unlike a regular page, an hoisted page is added at the root of the router, meaning before the host application root layout, root error boundary and even root authentication boundary. Thus, an hoisted page has full control over its rendering.

!!!warning
By declaring a page as hoisted, other parts of the application will not be isolated anymore from this page's failures as the page will be rendered outside of the host application's root error boundary. To avoid breaking the entire application when an hoisted page cause unmanaged errors, it is highly recommended to declare a React Router [errorElement](https://reactrouter.com/en/main/route/error-element) property on every hoisted page.
!!!

## Reference

```ts
const hoistedRoutes = useHoistedRoutes(routes: [], wrapManagedRoutes: () => {}, options?: { allowedPaths?: [] })
```

### Parameters

- `routes`: An array of `Route` to process.
- `wrapManagedRoutes`: A function nesting the managed routes under React elements such as a layout, an error boundary or an authentication boundary.
- `options`: An optional object literal of options.
    - `allowedPaths`: An optional array of exclusive route paths available for hosting.

### Returns

An array of `Route`.

## Usage

### Hoist a module page

```tsx !#16-26,30,33 host/src/App.tsx
import { useCallback, useMemo } from "react";
import { useAreRemotesReady } from "@squide/webpack-module-federation";
import { useRoutes, useHoistedRoutes, type Route } from "@squide/react-router";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { RootLayout } from "./RootLayout.tsx";
import { RootErrorBoundary } from "./RootErrorBoundary.tsx";

export function App() {
    const isReady = useAreRemotesReady();

    const routes = useRoutes();

    const wrapManagedRoutes = useCallback((managedRoutes: Route[]) => {
        return {
            // Default layout and error boundary.
            // Fore more information about React Router's nested routes, view https://reactrouter.com/en/main/start/tutorial#nested-routes.
            element: <RootLayout />,
            errorElement: <RootErrorBoundary />,
            children: [
                ...managedRoutes
            ]
        };
    }, []);

    // Allow hoisted routes to be rendered at the root of the router rather than 
    // under the default layout and error boundary.
    const hoistedRoutes = useHoistedRoutes(routes, wrapManagedRoutes);

    const router = useMemo(() => {
        return createBrowserRouter(hoistedRoutes);
    }, [hoistedRoutes]);

    if (!isReady) {
        return <div>Loading...</div>;
    }

    return (
        <RouterProvider
            router={router}
            fallbackElement={<div>Loading...</div>}
        />
    );
}
```

```tsx !#11 remote-module/src/register.tsx
import { lazy } from "react";
import type { ModuleRegisterFunction, Runtime } from "@squide/react-router";

const About = lazy(() => import("./About.tsx"));

export function register: ModuleRegisterFunction<Runtime>(runtime) {
    runtime.registerRoutes([
        {
            path: "/about",
            element: <About />,
            hoist: true
        }
    ]);

    runtime.registerNavigationItems([
        {
            to: "/about",
            label: "About"
        }
    ]);
}
```

### Register a module page with a different layout

!!!info
For a detailed walkthrough, read [the guide](/guides/override-the-host-layout.md) on how to override the host layout.
!!!

```tsx !#15,16 host/src/App.tsx
import { useCallback, useMemo } from "react";
import { useAreRemotesReady } from "@squide/webpack-module-federation";
import { useRoutes, useHoistedRoutes, type Route } from "@squide/react-router";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { RootLayout } from "./RootLayout.tsx";
import { RootErrorBoundary } from "./RootErrorBoundary.tsx";

export function App() {
    const isReady = useAreRemotesReady();

    const routes = useRoutes();

    const wrapManagedRoutes = useCallback((managedRoutes: Route[]) => {
        return {
            element: <RootLayout />,
            errorElement: <RootErrorBoundary />,
            children: [
                ...managedRoutes
            ]
        };
    }, []);

    const hoistedRoutes = useHoistedRoutes(routes, wrapManagedRoutes);

    const router = useMemo(() => {
        return createBrowserRouter(hoistedRoutes);
    }, [hoistedRoutes]);

    if (!isReady) {
        return <div>Loading...</div>;
    }

    return (
        <RouterProvider
            router={router}
            fallbackElement={<div>Loading...</div>}
        />
    );
}
```

```tsx !#11,14-20 remote-module/src/register.tsx
import { lazy } from "react";
import type { ModuleRegisterFunction, Runtime } from "@squide/react-router";

const RemoteLayout = lazy(() => import("./RemoteLayout.tsx"));
const About = lazy(() => import("./About.tsx"));

export function register: ModuleRegisterFunction<Runtime>(runtime) {
    runtime.registerRoutes([
        {
            path: "/about",
            hoist: true,
            // Will render the "About" page inside the "RemoteLayout" rather than the "RootLayout".
            // Fore more information about React Router's nested routes, view https://reactrouter.com/en/main/start/tutorial#nested-routes.
            element: <RemoteLayout />,
            children: [
                {
                    index: true,
                    element: <About />
                }
            ]
        }
    ]);

    runtime.registerNavigationItems([
        {
            to: "/about",
            label: "About"
        }
    ]);
}
```

### Register a public page

```tsx !#19-31 host/src/App.tsx
import { useCallback, useMemo } from "react";
import { useAreRemotesReady } from "@squide/webpack-module-federation";
import { useRoutes, useHoistedRoutes, type Route } from "@squide/react-router";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthenticationBoundary } from "./AuthenticationBoundary.tsx";
import { Login } from "./Login.tsx";
import { RootLayout } from "./RootLayout.tsx";
import { RootErrorBoundary } from "./RootErrorBoundary.tsx";

export function App() {
    const isReady = useAreRemotesReady();

    const routes = useRoutes();

    const wrapManagedRoutes = useCallback((managedRoutes: Route[]) => {
        return {
            element: <RootLayout />,
            errorElement: <RootErrorBoundary />,
            children: [
                {
                    path: "/login",
                    element: <Login />
                },
                {
                    // Authenticated boundary.
                    element: <AuthenticationBoundary />,
                    children: [
                        ...managedRoutes
                    ]
                }
            ]
        };
    }, []);

    const hoistedRoutes = useHoistedRoutes(routes, wrapManagedRoutes);

    const router = useMemo(() => {
        return createBrowserRouter(hoistedRoutes);
    }, [hoistedRoutes]);

    if (!isReady) {
        return <div>Loading...</div>;
    }

    return (
        <RouterProvider
            router={router}
            fallbackElement={<div>Loading...</div>}
        />
    );
}
```

```tsx !#13 remote-module/src/register.tsx
import { lazy } from "react";
import type { ModuleRegisterFunction, Runtime } from "@squide/react-router";

const About = lazy(() => import("./About.tsx"));

export function register: ModuleRegisterFunction<Runtime>(runtime) {
    runtime.registerRoutes([
        {
            path: "/about",
            element: <About />,
            // By hoisting the "About" page, it will now be rendered outside of the default 
            // authenticated boundary and will therefore be public.
            hoist: true
        }
    ]);

    runtime.registerNavigationItems([
        {
            to: "/about",
            label: "About"
        }
    ]);
}
```

### Allowing an exclusive set of routes to be hoisted

```tsx !#26-29 host/src/App.tsx
import { useCallback, useMemo } from "react";
import { useAreRemotesReady } from "@squide/webpack-module-federation";
import { useRoutes, useHoistedRoutes, type Route } from "@squide/react-router";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { RootLayout } from "./RootLayout.tsx";
import { RootErrorBoundary } from "./RootErrorBoundary.tsx";

export function App() {
    const isReady = useAreRemotesReady();

    const routes = useRoutes();

    const wrapManagedRoutes = useCallback((managedRoutes: Route[]) => {
        return {
            element: <RootLayout />,
            errorElement: <RootErrorBoundary />,
            children: [
                ...managedRoutes
            ]
        };
    }, []);

    const hoistedRoutes = useHoistedRoutes(routes, wrapManagedRoutes, {
        // Only the following route paths can be hoisted by modules.
        // When a page not included in the allowed paths is hoisted, an Error is thrown at rendering.
        allowedPaths: [
            "/about",
            "/another-page"
        ]
    });

    const router = useMemo(() => {
        return createBrowserRouter(hoistedRoutes);
    }, [hoistedRoutes]);

    if (!isReady) {
        return <div>Loading...</div>;
    }

    return (
        <RouterProvider
            router={router}
            fallbackElement={<div>Loading...</div>}
        />
    );
}
```

