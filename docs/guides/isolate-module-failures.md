---
order: 940
---

# Isolate module failures

One of the key characteristics of micro-frontends implementations like [iframes](https://martinfowler.com/articles/micro-frontends.html#Run-timeIntegrationViaIframes) and subdomains is the ability to isolate failures within individual modules, preventing them from breaking the entire application.

However, in a [Module Federation](https://module-federation.io/) implementation, this is not the case as all the modules share the same browsing context (e.g. the same [Document object](https://developer.mozilla.org/en-US/docs/Web/API/Document), the same [Window object](https://developer.mozilla.org/en-US/docs/Web/API/Window), and the same DOM). A failure in one module can potentially breaks the entire application.

Nevertheless, an application can get very close to iframes failure isolation by utilizing React Router's [Outlet](https://reactrouter.com/en/main/components/outlet) component and the [errorElement](https://reactrouter.com/en/main/route/error-element) property of a React Router's routes.

## Create an error boundary

First, define an error boundary to catch module errors. For this example we'll name it `RootErrorBoundary`:

```tsx host/src/RootErrorBoundary.tsx
export function RootErrorBoundary() {
    return (
        <div>An error occured while rendering a page from a module!</div>
    )
}
```

## Register the error boundary

Then, update the host application `registerHost` function to declare the `RootErrorBoundary` component below the `RootLayout` but above the routes of the modules. By doing so, if a module encounters an unhandled error, the error boundary will only replace the section rendered by the `Outlet` component within the `RootLayout` rather than the entire page:

```tsx !#7,11 host/src/register.tsx
import { ManagedRoutes, type ModuleRegisterFunction, type FireflyRuntime } from "@squide/firefly";
import { RootLayout } from "./RootLayout.tsx";
import { RootErrorBoundary } from "./RootErrorBoundary.tsx";

export const registerHost: ModuleRegisterFunction<FireflyRuntime> = runtime => {
    runtime.registerRoute({
        element: <RootLayout />,
        children: [
            {
                // Default error boundary.
                errorElement: <RootErrorBoundary />,
                children: [
                    ManagedRoutes
                ]
            }
        ]
    }, {
        hoist: true
    });
};
```

By implementing this mechanism, the level of failure isolation achieved is **comparable** to that of an **iframes** or **subdomains** implementation. With this mechanism, failure isolation **is as good as** with an **iframes** or **subdomains** implementation.

### Hoisted pages

If your application is [hoisting pages](../reference/runtime/runtime-class.md#register-an-hoisted-route), it's important to note that they will be rendered outside of the host application's root error boundary. To prevent breaking the entire application when an hoisted page encounters unhandled errors, it is highly recommended to declare a React Router's `errorElement` property for each hoisted page:

```tsx !#9,11 remote-module/src/register.tsx
import { ManagedRoutes, type ModuleRegisterFunction, type FireflyRuntime } from "@squide/firefly";
import { Page } from "./Page.tsx";
import { RemoteErrorBoundary } from "./RemoteErrorBoundary.tsx";

export const register: ModuleRegisterFunction<FireflyRuntime> = runtime => {
    runtime.registerRoute({
        path: "remote/page", 
        element: <Page />,
        errorElement: <RemoteErrorBoundary />
    }, {
        hoist: true
    });
};
```

## Try it :rocket:

Start the application in a development environment using the `dev` script. Update any of your application routes that is rendered under the newly created error boundary (e.g. that is not hoisted) and throw an `Error`. The error should be handled by the error boundary instead of breaking the whole application.

### Troubleshoot issues

If you are experiencing issues with this guide:

- Open the [DevTools](https://developer.chrome.com/docs/devtools/) console. You'll find a log entry for each registration that occurs and error messages if something went wrong.
- Refer to a working example on [GitHub](https://github.com/gsoft-inc/wl-squide/tree/main/samples/basic/shell).
- Refer to the [troubleshooting](../troubleshooting.md) page.
