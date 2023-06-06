---
order: 100
---

# Override the host layout

Most application pages usually share a **common layout** with at least: a navigation bar, a user profile menu and a main content section. In a [React Router's](https://reactrouter.com/en/main) application, this common layout is what we call a `RootLayout`:

```tsx !#12,17,23,27 App.tsx
import { useMemo } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { useRoutes } from "@squide/react-router";
import { RootLayout } from "./RootLayout.tsx";
import { AuthenticationBoundary } from "./AuthenticationBoundary.tsx";
import { Home } from "./Home.tsx";

export function App() {
    const routes = useRoutes();

    const router = useMemo(() => {
        return createBrowserRouter({
            // Pathless route to declare an authenticated boundary.
            element: <AuthenticationBoundary />,
            children: [
                // Pathless route to declare the root layout.
                element: <RootLayout />,
                children: [
                    {
                        index: "true",
                        element: <Home />
                    },
                    ...routes
                ]
            ]
        });
    }, [routes]);

    return (
        <RouterProvider
            router={router}
            fallbackElement={<div>Loading...</div>}
        />
    );
}
```

```tsx RootLayout.tsx
import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { useNavigationItems, useRenderedNavigationItems } from "@squide/react-router";
import { UserMenu } from "./UserMenu.tsx";

export function RootLayout() {
    const navigationItems = useNavigationItems();

    // To keep things simple, we are omitting the definition of "renderItem" and "renderSection".
    // For a full example, view: https://workleap.github.io/wl-squide/references/routing/userenderednavigationitems/.
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

In this example, the `RootLayout` is the default layout for the *home page* and every page (route) registered by a module.

For most pages, this is the behavior expected by the author. However, for pages such as a *login page*, the default `RootLayout` isn't a good fit because a *login page* is not bound to a user session (the user is not even authenticated yet).

Those pages in need of a different layout require a mechanism to pull out their route declaration at the root of the [React Router's](https://reactrouter.com/en/main) router instance, before the `RootLayout` is declared.

``` !#2
root
├── Login page   <---------------- Raise here
├──── Authentication boundary
├──────── Root layout
├───────────  Home page
```

Package managers supporting workspaces such as [Yarn](https://classic.yarnpkg.com/) and [NPM](https://docs.npmjs.com/cli) call this mechanism "hoisting", which means "raise (something) by means of ropes and pulleys". This is exactly what we are trying to achieve here.

`@squide` has a built-in [useHoistedRoutes](/references/routing/useHoistedRoutes.md) hook capable of raising module routes marked as `hoist` at the root of the routes array, before the `RootLayout` declaration. Thus, an hoisted page will not be wrapped by the `RootLayout` and will have full control over its rendering.

To hoist module pages, first transform the module routes with the [useHoistedRoutes](/references/routing/useHoistedRoutes.md) hook before creating the router instance:

```tsx !#12-26,30,34 App.tsx
import { useMemo } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { useRoutes, useHoistedRoutes, type Route } from "@squide/react-router";
import { RootLayout } from "./RootLayout.tsx";
import { AuthenticationBoundary } from "./AuthenticationBoundary.tsx";
import { Home } from "./Home.tsx";

export function App() {
    const routes = useRoutes();

    // Non hoisted routes will still be bound to the root layout.
    const wrapManagedRoutes = useCallback((managedRoutes: Route[]) => {
        return {
            element: <AuthenticationBoundary />,
            children: [
                element: <RootLayout />,
                children: [
                    {
                        index: "true",
                        element: <Home />
                    },
                    ...managedRoutes
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

    return (
        <RouterProvider
            router={router}
            fallbackElement={<div>Loading...</div>}
        />
    );
}
```

Then, mark the pages as hoisted and optionally declare a different layout:

```tsx !#11-12 local-module/src/register.tsx
import { lazy } from "react";
import type { ModuleRegisterFunction, Runtime } from "@squide/react-router";

const AnotherLayout = lazy(() => import("./AnotherLayout.tsx"));
const Login = lazy(() => import("./Login.tsx"));

export function register: ModuleRegisterFunction<Runtime>(runtime) {
    runtime.registerRoutes([
        {
            path: "/login",
            hoist: true,
            element: <AnotherLayout />,
            children: [
                {
                    index: true,
                    element: <Login />
                }
            ]
        }
    ]);
}
```

[!ref icon="gear" text="For additional options, go to the `useHoistedRoutes` hook reference page"](/references/routing/useHoistedRoutes.md)


