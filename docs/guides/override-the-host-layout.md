---
order: 100
---

# Override the host layout

## Define a root layout

In many applications, multiple pages often share a **common layout** that includes elements such as a navigation bar, a user profile menu, and a main content section. In a [React Router](https://reactrouter.com/en/main) application, this shared layout is commonly referred to as a `RootLayout`:


```tsx !#16,21,24,30,36 host/src/App.tsx
import { useMemo } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { useRoutes } from "@squide/react-router";
import { useAreModulesReady } from "@squide/webpack-module-federation";
import { RootLayout } from "./RootLayout.tsx";
import { RootErrorBoundary } from "./RootErrorBoundary.tsx";
import { AuthenticationBoundary } from "./AuthenticationBoundary.tsx";
import { Home } from "./Home.tsx";

export function App() {
    const areModulesReady = useAreModulesReady();

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

    if (!areModulesReady) {
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

In the previous code sample, the `RootLayout` serves as the default layout for the home page as well as for every page (route) registered by a module.

For most pages, this is the behavior expected by the author. However, for pages such as a login page, the default `RootLayout` isn't suitable because the page is not bound to a user session (the user is not even authenticated yet).

To accomodate pages that require a different layout, a mechanism is needed to move their route declaration at the root of the React Router [router instance](https://reactrouter.com/en/main/routers/create-browser-router), before the `RootLayout` is declared.

``` !#2
root
├── Login page   <---------------- Raise the page here
├──── Authentication boundary
├──────── Root layout
├───────────  Home page
```

## Hoist the module pages

Package managers supporting workspaces such as Yarn and NPM call this mechanism "hoisting", which means "raise (something) by means of ropes and pulleys". This is exactly what we are trying to achieve here.

Squide has a built-in [useHoistedRoutes](/reference/routing/useHoistedRoutes.md) hook capable of raising module routes marked as `hoist` at the root of the routes array, before the `RootLayout` declaration. Thus, an hoisted page will not be wrapped by the `RootLayout` and will have full control over its rendering.

To hoist module pages, first transform the module routes with the `useHoistedRoutes` hook before creating the router instance:

```tsx #15-34,38,42 host/src/App.tsx
import { useMemo } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { useRoutes, useHoistedRoutes, type Route } from "@squide/react-router";
import { useAreModulesReady } from "@squide/webpack-module-federation";
import { RootLayout } from "./RootLayout.tsx";
import { AuthenticationBoundary } from "./AuthenticationBoundary.tsx";
import { Home } from "./Home.tsx";

export function App() {
    const areModulesReady = useAreModulesReady();

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

    if (!areModulesReady) {
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

```tsx #13,16-17,23 local-module/src/register.tsx
import { lazy } from "react";
import type { ModuleRegisterFunction, Runtime } from "@squide/react-router";
import { LocalLayout } from "./LocalLayout.tsx";
import { LocalErrorBoundary } from "./LocalErrorBoundary.tsx";
import { Login } from "./Login.tsx";

export function register: ModuleRegisterFunction<Runtime>(runtime) {
    runtime.registerRoute({
        path: "/login",
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
    }, {
        hoist: true
    });
}
```

!!!warning
By declaring a page as hoisted, the page will be rendered at the root of the router, therefore, most certainly outside the authenticated boundary of the application. If the hoisted page requires an authentication, make sure to **wrap the page with an authentication boundary** or to handle the authentication within the page.
!!!

[!ref text="For additional options, go to the `useHoistedRoutes` hook reference page"](/reference/routing/useHoistedRoutes.md)

## Try it :rocket:

Start the application in a development environment using the `dev` script and navigate to the `/login` page. The page should be displayed even if you are not authenticated.

!!!info
If you are having issues with this guide, have a look at a working example on [GitHub](https://github.com/gsoft-inc/wl-squide/tree/main/sample/shell).
!!!
