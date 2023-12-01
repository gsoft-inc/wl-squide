---
order: 880
---

# Override the host layout

## Define a root layout

In many applications, multiple pages often share a **common layout** that includes elements such as a navigation bar, a user profile menu, and a main content section. In a [React Router](https://reactrouter.com/en/main) application, this shared layout is commonly referred to as a `RootLayout`:

```tsx !#9,11,14,16 host/src/register.tsx
import { ManagedRoutes, type ModuleRegisterFunction, type FireflyRuntime } from "@squide/firefly";
import { HomePage } from "./HomePage.tsx";
import { AuthenticationBoundary } from "./AuthenticationBoundary.tsx";
import { RootLayout } from "./RootLayout.tsx";
import { RootErrorBoundary } from "./RootErrorBoundary.tsx";

export const registerHost: ModuleRegisterFunction<FireflyRuntime> = runtime => {
    runtime.registerRoute({
        element: <AuthenticationBoundary />,
        children: [
            element: <RootLayout />,
            children: [
                {
                    errorElement: <RootErrorBoundary />,
                    children: [
                        ManagedRoutes
                    ]
                }
            ]
        ]
    }, {
        // We will talk about this in the next section of this guide.
        hoist: true
    });

    runtime.registerRoute({
        index: true,
        element: <HomePage />
    });
};
```

```tsx host/src/RootLayout.tsx
import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { useNavigationItems, useRenderedNavigationItems } from "@squide/firefly";
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

In the previous code sample, the `RootLayout` serves as the default layout for the homepage as well as for every page (route) registered by a module that are not nested under a parent route with either the [parentPath](../reference/runtime/runtime-class.md#register-nested-routes-under-an-existing-route) or the [parentName](../reference/runtime/runtime-class.md#register-a-named-route) option.

For most pages, this is the behavior expected by the author. However, for pages such as a login, the default `RootLayout` isn't suitable because the page is not bound to a user session (the user is not even authenticated yet).

To accomodate pages that require a different layout, a mechanism is needed to move their route declaration at the root of the React Router [router instance](https://reactrouter.com/en/main/routers/create-browser-router), before the `RootLayout` is declared.

``` !#2
root
├── Login page   <---------------- Raise the page here
├──── Authentication boundary
├──────── Root layout
├───────────  Homepage
```

## Hoist a module pages

Package managers supporting workspaces such as Yarn and NPM call this mechanism "hoisting", which means "raise (something) by means of ropes and pulleys". This is exactly what we are trying to achieve here.

Squide has a built-in [hoist](../reference/runtime/runtime-class.md#register-an-hoisted-route) functionality capable of raising module routes marked as `hoist` at the root of the routes array, before the `RootLayout` declaration. Thus, an hoisted page will not be wrapped by the `RootLayout` (or the `AuthenticationBoundary`) and will have full control over its rendering.

To hoist module pages, add the [hoist](../reference/runtime/runtime-class.md#register-an-hoisted-route) option to the route registration options and optionally use a different layout:

```tsx !#9,14,24 local-module/src/register.tsx
import type { ModuleRegisterFunction, FireflyRuntime } from "@squide/firefly";
import { LocalLayout } from "./LocalLayout.tsx";
import { LocalErrorBoundary } from "./LocalErrorBoundary.tsx";
import { LoginPage } from "./LoginPage.tsx";

export function register: ModuleRegisterFunction<FireflyRuntime>(runtime) {
    runtime.registerRoute({
        path: "/login",
        element: <LocalLayout />,
        children: [
            {
                // Custom error boundary ensuring errors from the login page doesn't prevent the other
                // modules of the application from rendering.
                errorElement: <LocalErrorBoundary />,
                children: [
                    {
                        index: true,
                        element: <LoginPage />
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
By declaring a page as hoisted, other parts of the application will not be isolated anymore from this page's failures as the page will be rendered outside of the host application's root error boundary. To **avoid breaking the entire application** when an hoisted page encounters unhandled errors, it is highly recommended to declare a React Router's [errorElement](https://reactrouter.com/en/main/route/error-element) property for each hoisted page.
!!!

!!!warning
By declaring a page as hoisted, the page will be rendered at the root of the router, therefore, most certainly outside the authenticated boundary of the application. If the hoisted page requires an authentication, make sure to **wrap the page with an authentication boundary** or to handle the authentication within the page.
!!!

## Try it :rocket:

Start the application in a development environment using the `dev` script and navigate to the `/login` page. The page should be displayed even if you are not authenticated.

### Troubleshoot issues

If you are experiencing issues with this guide:

- Open the [DevTools](https://developer.chrome.com/docs/devtools/) console. You'll find a log entry for each registration that occurs and error messages if something went wrong.
- Refer to a working example on [GitHub](https://github.com/gsoft-inc/wl-squide/blob/main/samples/basic/remote-module/src/register.tsx).
- Refer to the [troubleshooting](../troubleshooting.md) page.
