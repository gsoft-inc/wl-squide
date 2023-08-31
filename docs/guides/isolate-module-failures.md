---
order: 90
---

# Isolate module failures

One of the key characteristics of micro-frontends implementations like [iframes](https://martinfowler.com/articles/micro-frontends.html#Run-timeIntegrationViaIframes) and subdomains is the ability to isolate failures within individual remote modules, preventing them from breaking the entire application.

However, in a [Module Federation](https://webpack.js.org/concepts/module-federation/) implementation, this is not the case as all the remote modules share the same browsing context (e.g. the same [Document](https://developer.mozilla.org/en-US/docs/Web/API/Document), the same [Window object](https://developer.mozilla.org/en-US/docs/Web/API/Window), and the same [DOM](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model)). A failure in one remote module can potentially breaks the entire application.

Nevertheless, we can get very close to iframes failure isolation by utilizing React Router's [Outlet](https://reactrouter.com/en/main/components/outlet) component and the [errorElement](https://reactrouter.com/en/main/route/error-element) property of a React Router's routes:

```tsx !#16,20 host/src/App.tsx
import { useMemo } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { useAreRemotesReady } from "@squide/webpack-module-federation";
import { useRoutes } from "@squide/react-router";
import { RootLayout } from "./RootLayout.tsx";
import { RootErrorBoundary } from "./RootErrorBoundary.tsx";

export function App() {
    const isReady = useAreRemotesReady();

    const routes = useRoutes();

    const router = useMemo(() => {
        return createBrowserRouter({
            // Default layout.
            element: <RootLayout />,
            children: [
                {
                    // Default error boundary.
                    errorElement: <RootErrorBoundary />,
                    children: [
                        ...routes
                    ]
                }
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

```tsx !#16 host/src/RootLayout.tsx
import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { useNavigationItems, useRenderedNavigationItems } from "@squide/react-router";

export function RootLayout() {
    const navigationItems = useNavigationItems();

    // To keep things simple, we are omitting the definition of "renderItem" and "renderSection".
    // For a full example, view: https://gsoft-inc.github.io/wl-squide/reference/routing/userenderednavigationitems/.
    const navigationElements = useRenderedNavigationItems(navigationItems, renderItem, renderSection);

    return (
        <>
            <nav>{navigationElements}</nav>
            <Suspense fallback={<div>Loading...</div>}>
                <Outlet />
            </Suspense>
        </>
    );
}
```

In the previous code sample, a `RootErrorBoundary` is declared below the `RootLayout` but above the routes of the *remote module*. By doing so, if a module encounters an unhandled error, the nested error boundary will only replace the section rendered by the `Outlet` component within the `RootLayout` rather than the entire page.

By implementing this mechanism, the level of failure isolation achieved is **comparable** to that of an **iframes** or **subdomains** implementation.

With this mechanism, failure isolation **is as good as** with an **iframes** or **subdomains** implementation.

!!!warning
If your application is [hoisting page](/reference/routing/useHoistedRoutes.md), it's important to note that they will be rendered outside of the host application's root error boundary. To prevent breaking the entire application when an hoisted page encounters unhandled errors, it is highly recommended to declare a React Router's `errorElement` property for each hoisted page.
!!!
