---
order: 90
---

# Isolate module failures

One of the key characteristics of micro-frontends implementations like [iframes](https://martinfowler.com/articles/micro-frontends.html#Run-timeIntegrationViaIframes) and subdomains is that a single module failure can't break the whole application.

With a [Webpack Module Federation](https://webpack.js.org/concepts/module-federation/) implementation, this is not the case as all the modules share the same browsing context (e.g. the same [Document](https://developer.mozilla.org/en-US/docs/Web/API/Document), the same [Window object](https://developer.mozilla.org/en-US/docs/Web/API/Window), and the same [DOM](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model)).

Still, we can get very close to iframes failure isolation by leveraging React Router's [Outlet](https://reactrouter.com/en/main/components/outlet) component and routes' [errorElement](https://reactrouter.com/en/main/route/error-element) property:

```tsx !#16,20 App.tsx
import { useCallback, useMemo } from "react";
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

```tsx !#16 RootLayout.tsx
import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { useNavigationItems, useRenderedNavigationItems } from "@squide/react-router";

export function RootLayout() {
    const navigationItems = useNavigationItems();

    // To keep things simple, we are omitting the definition of "renderItem" and "renderSection".
    // For a full example, view: https://workleap.github.io/wl-squide/references/routing/userenderednavigationitems/.
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

In the previous code sample, a `RootErrorBoundary` is declared under the `RootLayout` but over the modules routes. By doing so, if a module cause an unmanaged error, the nested error boundary will only replace the section rendered by the `Outlet` component of the `RootLayout` instead of the whole page.

With this mechanism in place, failure isolation is as good as with an [iframes](https://martinfowler.com/articles/micro-frontends.html#Run-timeIntegrationViaIframes) or subdomains implementation.

!!!warning
[Hoisted pages](/references/routing/useHoistedRoutes.md) are rendered outside of the *host* application root error boundary. If your modules are hoisting pages, to avoid breaking the entire application when an hoisted page cause unmanaged errors, it is highly recommended to declare a React Router [errorElement](https://reactrouter.com/en/main/route/error-element) property on every hoisted page.
!!!
