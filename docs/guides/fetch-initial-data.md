---
order: 980
---

# Fetch initial data

!!!warning
Before going forward with this guide, make sure that you completed the [setup Mock Service Worker](./setup-msw.md) guide.
!!!

Retrieving the initial data of an application is a crucial aspect that isn't always straightforward to implement. That's why we encourage feature teams to build their initial data fetching strategy on top of the Squide [AppRouter](../reference/routing/appRouter.md) component.

## Challenges with initial data

At first glance, one might wonder what could be so complicated about fetching the initial data of an application. It's only fetches ...right? Well, there are several concerns to take into account for a Squide application:

- When in development, the initial data cannot be fetched until the Mock Service Worker (MSW) **request handlers** are **registered** and **MSW is started**.

- To register the MSW request handlers, the **remote modules** must be **registered** first.

- If the requested page is _public_, only the initial public data should be fetched.

- If the requested page is _protected_, **both** the initial **public** and **protected data** should be **fetched**.

- The requested page cannot be rendered until the initial data has been fetched.

- A **unique loading spinner** should be displayed to the user while the modules are being registered, the MSW request handlers are being registered and the initial data is being fetched, ensuring **no flickering** due to different spinners being rendered.

To help manage those concerns, Squide offer an `AppRouter` component that takes care of setuping Squide federated primitive and orchestrating the different states.

## Fetch public data

### Add an endpoint

First, define an MSW request handler that returns the number of times it has been fetched:

```ts mocks/handlers.ts
import { HttpResponse, http, type HttpHandler } from "msw";

let fetchCount = 0;

export const requestHandlers: HttpHandler[] = [
    http.get("/api/count", () => {
        fetchCount += 1;

        return HttpResponse.json([{
            "count": fetchCount
        }]);
    })
];
```

Then, register the request handler using the module registration function:

```tsx !#7 src/register.tsx
import type { ModuleRegisterFunction, FireflyRuntime } from "@squide/firefly"; 

export const register: ModuleRegisterFunction<FireflyRuntime> = async runtime => {
    if (process.env.USE_MSW) {
        // Files that includes an import to the "msw" package are included dynamically to prevent adding
        // unused MSW stuff to the application bundles.
        const requestHandlers = (await import("../mocks/handlers.ts")).requestHandlers;

        runtime.registerRequestHandlers(requestHandlers);
    }
}
```

### Create a shared context

Then, in a shared project, create a React context named `FetchCountContext`:

```ts shared/src/fetchCountContext.ts
import { createContext, useContext } from "react";

export const FetchCountContext = createContext(0);

export function useFetchCount() {
    return useContext(FetchCountContext);
}
```

!!!info
Ensure that the shared project is configured as a [shared dependency](./add-a-shared-dependency.md).
!!!

### Fetch the data

Finally, open the host application code and update the `App` component to utilize the `AppRouter` component's [onLoadPublicData](../reference/routing/appRouter.md#load-public-data) handler. This handler will fetch the count and forward the retrieved value through `FetchCountContext`:

```tsx !#14,16-18,21,23 host/src/App.tsx
import { useState, useCallback } from "react";
import { AppRouter } from "@squide/firefly";
import { FetchCountContext } from "@sample/shared";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

async function fetchPublicData(setFetchCount: (fetchCount: number) => void) {
    const response = await fetch("/api/count");
    const data = await response.json();

    setFetchCount(data.count);
}

export function App() {
    const [fetchCount, setFetchCount] = useState(0);

    const handleLoadPublicData = useCallback(() => {
        return fetchPublicData(setFetchCount);
    }, []);

    return (
        <FetchCountContext.Provider value={fetchCount}>
            <AppRouter
                onLoadPublicData={handleLoadPublicData}
                fallbackElement={<div>Loading...</div>}
                errorElement={<div>An error occured!</div>}
                waitForMsw={true}
            >
                {(routes, providerProps) => (
                    <RouterProvider router={createBrowserRouter(routes)} {...providerProps} />
                )}
            </AppRouter>
        </FetchCountContext.Provider>
    );
}
```

!!!info
The `onLoadPublicData` handler must return a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) object. When the [async](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function) keyword is included in a function signature, the function will automatically return a `Promise` object.
!!!

### Use the endpoint data

Now, create a `InitialDataLayout` component that utilizes the count retrieved from `FetchCountContext` and render pages with a green background color if the value is odd:

```tsx !#5,10 src/InitialDataLayout.tsx
import { useFetchCount } from "@sample/shared";
import { Outlet } from "react-router-dom";

export function InitialDataLayout() {
    const fetchCount = useFetchCount();

    const isOdd = fetchCount % 2 === 0;

    return (
        <div style={{ backgroundColor: isOdd ? "green" : undefined }}>
            <Outlet />
        </div>
    )
}
```

Then, create a `Page` component:

```tsx src/Page.tsx
export function Page() {
    return (
        <div>When the fetch count is odd, my background should be green.</div>
    )
}
```

Finally, register both components:

```tsx !#8,12 src/register.tsx
import type { ModuleRegisterFunction, FireflyRuntime } from "@squide/firefly";
import { InitialDataLayout } from "./InitialDataLayout.tsx";
import { Page } from "./Page.tsx";

export const register: ModuleRegisterFunction<FireflyRuntime> = async runtime => {
    runtime.registerRoute({
        path: "/initial-data",
        element: <InitialDataLayout />,
        children: [
            {
                index: true,
                element: <Page />
            }
        ]
    });

    runtime.registerNavigationItem({
        $label: "Initial data Page",
        to: "/initial-data"
    });

    if (process.env.USE_MSW) {
        // Files that includes an import to the "msw" package are included dynamically to prevent adding
        // unused MSW stuff to the application bundles.
        const requestHandlers = (await import("../mocks/handlers.ts")).requestHandlers;

        runtime.registerRequestHandlers(requestHandlers);
    }
}
```

### Try it :rocket:

Start the application in a development environment using the `dev` script and navigate to the `/initial-data` page. Refresh the page a few times, the background color should alternate between transparent and green.

#### Troubleshoot issues

If you are experiencing issues with this section of the guide:

- Open the [DevTools](https://developer.chrome.com/docs/devtools/) console. You'll find a log entry for each registration that occurs (including MSW request handlers) and error messages if something went wrong.
- Refer to a working example on [GitHub](https://github.com/gsoft-inc/wl-squide/tree/main/samples/endpoints).
- Refer to the [troubleshooting](../troubleshooting.md) page.

## Fetch protected data

Now, let's load _protected_ data. The process is similar to fetching public data, but this time, we'll use the [onLoadProtectedData](../reference/routing/appRouter.md#load-protected-data) handler of the `AppRouter` component instead.

### Add an endpoint

First, define a MSW request handler that returns a user tenant subscription data:

```ts !#14-21 mocks/handlers.ts
import { HttpResponse, http, type HttpHandler } from "msw";

let fetchCount = 0;

export const requestHandlers: HttpHandler[] = [
    http.get("/api/count", () => {
        fetchCount += 1;

        return HttpResponse.json([{
            "count": fetchCount
        }]);
    }),

    http.get("/api/subscription", () => {
        // NOTE:
        // The user id should be retrieved from the current session and the subscription should be retrieved from a database with this id.
        // For the sake of simplicity, we haven't done it for this guide, instead we return hardcoded data.
        return HttpResponse.json([{
            "status": "paid"
        }]);
    })
];
```

If you've registered the [public data request handler](#add-an-endpoint), the newly created request handler should be automatically registered.

!!!warning
In the previous code sample, for the sake of simplicity, we haven't secured the request handler or implemented session management. However, please be aware that you should do it for a real Workleap application.
!!!

### Create a shared context

Then, in a shared project, create a `SubscriptionContext`:

```ts shared/src/subscriptionContext.ts
import { createContext, useContext } from "react";

export interface Subscription {
    status: string
}

export const SubscriptionContext = createContext(Subscription | undefined);

export function useSubscription() {
    return useContext(SubscriptionContext);
}
```

!!!info
Ensure that the shared project is configured as a [shared dependency](./add-a-shared-dependency.md).
!!!

### Fetch the data

Finally, open the host application code and update the `App` component to utilize the `AppRouter` component's `onLoadProtectedData` handler. This handler will fetch the user tenant subscription and forward the retrieved value through `SubscriptionContext`:

```tsx !#26,32-34,38,41 host/src/App.tsx
import { useState, useCallback } from "react";
import { AppRouter } from "@squide/firefly";
import { FetchCountContext, SubscriptionContext, type Subscription } from "@sample/shared";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

async function fetchPublicData(setFetchCount: (fetchCount: number) => void) {
    const response = await fetch("/api/count");
    const data = await response.json();

    setFetchCount(data.count);
}

async function fetchProtectedData(setSubscription: (subscription: Subscription) => void) {
    const response = await fetch("/api/subscription");
    const data = await response.json();

    const subscription: Subscription = {
        status: data.status
    };

    setSubscription(subscription);
}

export function App() {
    const [fetchCount, setFetchCount] = useState(0);
    const [subscription, setSubscription] = useState<Subscription>();

    const handleLoadPublicData = useCallback(() => {
        return fetchPublicData(setFetchCount);
    }, []);

    const handleLoadProtectedData = useCallback(() => {
        return fetchProtectedData(setSubscription);
    }, []);

    return (
        <FetchCountContext.Provider value={fetchCount}>
            <SubscriptionContext.Provider value={subscription}>
                <AppRouter
                    onLoadPublicData={handleLoadPublicData}
                    onLoadProtectedData={handleLoadProtectedData}
                    fallbackElement={<div>Loading...</div>}
                    errorElement={<div>An error occured!</div>}
                    waitForMsw={true}
                >
                    {(routes, providerProps) => (
                        <RouterProvider router={createBrowserRouter(routes)} {...providerProps} />
                    )}
                </AppRouter>
            <SubscriptionContext.Provider />
        </FetchCountContext.Provider>
    );
}
```

### Use the endpoint data

Now, update the `InitialDataLayout` component that was previously created for the [public data example](#use-the-endpoint-data) to render the user tenant subscription status:

```tsx !#6,11 src/InitialDataLayout.tsx
import { useFetchCount, useSubscription } from "@sample/shared";
import { Outlet } from "react-router-dom";

export function InitialDataLayout() {
    const fetchCount = useFetchCount();
    const subscription = useSubscription();

    const isOdd = fetchCount % 2 === 0;

    return (
        <div>Subscription status: {subscription?.status}</div>
        <div style={{ backgroundColor: isOdd ? "green" : undefined }}>
            <Outlet />
        </div>
    )
}
```

### Try it :rocket:

Start the application in a development environment using the `dev` script and navigate to the `/initial-data` page. You should notice the subscription status.

#### Troubleshoot issues

If you are experiencing issues with this section of the guide:

- Open the [DevTools](https://developer.chrome.com/docs/devtools/) console. You'll find a log entry for each registration that occurs (including MSW request handlers) and error messages if something went wrong.
- Refer to a working example on [GitHub](https://github.com/gsoft-inc/wl-squide/tree/main/samples/endpoints).
- Refer to the [troubleshooting](../troubleshooting.md) page.




