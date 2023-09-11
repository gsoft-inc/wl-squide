---
order: 100
---

# Override the host layout

## Root layout

In many applications, multiple pages often share a **common layout** that includes elements such as a navigation bar, a user profile menu, and a main content section. In a [React Router](https://reactrouter.com/en/main) application, this shared layout is commonly referred to as a `RootLayout`:


```tsx !#16,21,24,30,36 host/src/App.tsx
import { useMemo } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { useRoutes } from "@squide/react-router";
import { useAreRemotesReady } from "@squide/webpack-module-federation";
import { RootLayout } from "./RootLayout.tsx";
import { RootErrorBoundary } from "./RootErrorBoundary.tsx";
import { AuthenticationBoundary } from "./AuthenticationBoundary.tsx";
import { Home } from "./Home.tsx";

export function App() {
    const isReady = useAreRemotesReady();

    const routes = useRoutes();

    const router = useMemo(() => {
        return createBrowserRouter({
            // Pathless route to declare an authentication boundary.
            element: <AuthenticationBoundary />,
            children: [
                // Pathless route to declare the root layout.
                element: <RootLayout />,
                children: [
                    {
                        errorElement: <RootErrorBoundary />,
                        children: [
                            {
                                index: "true",
                                element: <Home />
                            },
                            ...routes
                        ]
                    }
                ]
            ]
        });
    }, [routes]);

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

```tsx host/src/RootLayout.tsx
import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { useNavigationItems, useRenderedNavigationItems } from "@squide/react-router";
import { UserMenu } from "./UserMenu.tsx";

export function RootLayout() {
    const navigationItems = useNavigationItems();

    // To keep things simple, we are omitting the definition of "renderItem" and "renderSection".
    // For a full example, view: https://gsoft-inc.github.io/wl-squide/reference/routing/userenderednavigationitems/.
    const navigationElements = useRenderedNavigationItems(navigationItems, renderItem, renderSection);

    return (
        <>
            <div>
                <nav>{navigationElements}</nav>
                <UserMenu />
            </div>
            <Suspense fallback={<div>Loading...</div>}>
                <Outlet />
            </Suspense>
        </>
    );
}
```

In the previous code sample, the `RootLayout` serves as the default layout for the *home page* as well as for every page (route) registered by a module.

For most pages, this is the behavior expected by the author. However, for pages such as a *login page*, the default `RootLayout` isn't suitable because the page is not bound to a user session (the user is not even authenticated yet).

To accomodate pages that require a different layout, a mechanism is needed to move their route declaration at the root of the React Router [router instance](https://reactrouter.com/en/main/routers/create-browser-router), before the `RootLayout` is declared.

``` !#2
root
├── Login page   <---------------- Raise the page here
├──── Authentication boundary
├──────── Root layout
├───────────  Home page
```

## Hoisting

Package managers supporting workspaces such as Yarn and NPM call this mechanism "hoisting", which means "raise (something) by means of ropes and pulleys". This is exactly what we are trying to achieve here.

`@squide` has a built-in [useHoistedRoutes](/reference/routing/useHoistedRoutes.md) hook capable of raising module routes marked as `hoist` at the root of the routes array, before the `RootLayout` declaration. Thus, an hoisted page will not be wrapped by the `RootLayout` and will have full control over its rendering.

To hoist module pages, first transform the module routes with the `useHoistedRoutes` hook before creating the router instance:

```tsx #15-34,38,42 host/src/App.tsx
import { useMemo } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { useRoutes, useHoistedRoutes, type Route } from "@squide/react-router";
import { useAreRemotesReady } from "@squide/webpack-module-federation";
import { RootLayout } from "./RootLayout.tsx";
import { AuthenticationBoundary } from "./AuthenticationBoundary.tsx";
import { Home } from "./Home.tsx";

export function App() {
    const isReady = useAreRemotesReady();

    const routes = useRoutes();

    // Non hoisted routes will still be bound to the root layout.
    const wrapManagedRoutes = useCallback((managedRoutes: Route[]) => {
        return {
            element: <AuthenticationBoundary />,
            children: [
                element: <RootLayout />,
                children: [
                    {
                        errorElement: <RootErrorBoundary />,
                        children: [
                            {
                                index: "true",
                                element: <Home />
                            },
                            ...routes
                        ]
                    }
                ]
            ]
        };
    }, []);

    // Allow hoisted routes hoisted by modules to be rendered at the root of the router rather than 
    // under the root layout.
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

Then, mark the pages as hoisted and optionally use a new layout:

```tsx #12-13,16,19-20 local-module/src/register.tsx
import { lazy } from "react";
import type { ModuleRegisterFunction, Runtime } from "@squide/react-router";

const LocalLayout = lazy(() => import("./LocalLayout.tsx"));
const LocalErrorBoundary = lazy(() => import("./LocalErrorBoundary.tsx"));
const Login = lazy(() => import("./Login.tsx"));

export function register: ModuleRegisterFunction<Runtime>(runtime) {
    runtime.registerRoutes([
        {
            path: "/login",
            hoist: true,
            element: <LocalLayout />,
            children: [
                {
                    errorElement: <LocalErrorBoundary />,
                    children: [
                        {
                            index: true,
                            element: <Login />
                        }
                    ]
                }
            ]
        }
    ]);
}
```

[!ref icon="gear" text="For additional options, go to the `useHoistedRoutes` hook reference page"](/reference/routing/useHoistedRoutes.md)


