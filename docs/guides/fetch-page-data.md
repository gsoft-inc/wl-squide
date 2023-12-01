---
order: 975
---

# Fetch page data

There are so various approaches to fetching data for pages. At [Workleap](https://workleap.com/), our preference is usually to develop a dedicated endpoint per page, returning a denormalized document specifically tailored for that page. We rely on server state as our singular source of truth and leverage [React Query](https://tanstack.com/query/latest/) to manage data fetching and ensure our data remains up-to-date.

While this approach works well, a few adjustments are necessary when transitioning from a monolithic application to a federated application.

!!!warning
Before going forward with this guide, make sure that you completed the [Setup Mock Service Worker](./setup-msw.md) guide.
!!!

## Setup React Query

Let's start by adding React Query to a project. The following examples uses a local module, but the same could be done in a host application or a remote module.

First, open a terminal at the root of the local module and install the following packages:

+++ pnpm
```bash
pnpm add -D @tanstack/react-query-devtools
pnpm add @tanstack/react-query
```
+++ yarn
```bash
yarn add -D @tanstack/react-query-devtools
yarn add @tanstack/react-query
```
+++ npm
```bash
npm install -D @tanstack/react-query-devtools
npm install @tanstack/react-query
```
+++

!!!warning
While you can use any package manager to develop an application with Squide, it is highly recommended that you use [PNPM](https://pnpm.io/) as the guides has been developed and tested with PNPM.
!!!

### Use the query client

Then, instanciate a [QueryClient](https://tanstack.com/query/latest/docs/react/reference/QueryClient) instance in the module registration function and wrap the routes element with a [QueryClientProvider](https://tanstack.com/query/latest/docs/react/reference/QueryClientProvider):

```tsx !#7,12 local-module/src/register.tsx
import type { ModuleRegisterFunction, FireflyRuntime } from "@squide/firefly";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Page } from "./Page.tsx";

// To minimize unexpected situations and faciliate maintenance, do not share the React Query cache.
// Instead create a distinct query client per module.
const queryClient = new QueryClient();

export const register: ModuleRegisterFunction<FireflyRuntime> = runtime => {
    runtime.registerRoute({
        path: "/local/page",
        element: <QueryClientProvider client={queryClient}><Page /></QueryClientProvider>
    });

    runtime.registerNavigationItem({
        $label: "Local/Page",
        to: "/local/page"
    });
}
```

To minimize unexpected situations and faciliate maintenance, the React Query cache shouldn't be shared between the host application and the modules. As the React Query cache is located in the `QueryClient`, both the host application and the modules should instantiate their own `QueryClient` instance.

If the module register multiple routes, to prevent duplicating registration code, we recommend creating a `Providers` component:

```tsx !#9-15,20 local-module/src/register.tsx
import type { ModuleRegisterFunction, FireflyRuntime } from "@squide/firefly";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Page } from "./Page.tsx";

// To minimize unexpected situations and faciliate maintenance, do not share the React Query cache.
// Instead create a distinct query client per module.
const queryClient = new QueryClient();

function Providers({ children }: { children: ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}

export const register: ModuleRegisterFunction<FireflyRuntime> = runtime => {
    runtime.registerRoute({
        path: "/local/page",
        element: <Providers><Page /></Providers>
    });

    runtime.registerNavigationItem({
        $label: "Local/Page",
        to: "/local/page"
    });
}
```

### Setup the development tools

To faciliate development, React Query provides [devtools](https://tanstack.com/query/latest/docs/react/devtools) to help visualize all of the inner workings of React Query.

However, the React Query devtools are not been developed to handle a federated application with multiple `QueryClient` instances. To use the devtools, you have to define a `ReactQueryDevtools` component for each `QueryClient` instance:

```tsx !#14 local-module/src/register.tsx
import type { ModuleRegisterFunction, FireflyRuntime } from "@squide/firefly";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Page } from "./Page.tsx";

// To minimize unexpected situations and faciliate maintenance, do not share the React Query cache.
// Instead create a distinct query client per module.
const queryClient = new QueryClient();

function Providers({ children }: { children: ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            {children}
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    );
}

export const register: ModuleRegisterFunction<FireflyRuntime> = runtime => {
    runtime.registerRoute({
        path: "/local/page",
        element: <Providers><Page /></Providers>
    });

    runtime.registerNavigationItem({
        $label: "Local/Page",
        to: "/local/page"
    });
}
```

Then, depending on which page of the application has been rendered, a distinct devtools instance will be accessible. For a better experience, we recommend activating the React Query devtools exclusively when developing a module [in isolation](./develop-a-module-in-isolation.md):

```tsx !#14-16 local-module/src/register.tsx
import type { ModuleRegisterFunction, FireflyRuntime } from "@squide/firefly";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Page } from "./Page.tsx";

// To minimize unexpected situations and faciliate maintenance, do not share the React Query cache.
// Instead create a distinct query client per module.
const queryClient = new QueryClient();

function Providers({ children }: { children: ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            {children}
            {process.env.ISOLATED && (
                <ReactQueryDevtools initialIsOpen={false} />
            )}
        </QueryClientProvider>
    );
}

export const register: ModuleRegisterFunction<FireflyRuntime> = runtime => {
    runtime.registerRoute({
        path: "/local/page",
        element: <Providers><Page /></Providers>
    });

    runtime.registerNavigationItem({
        $label: "Local/Page",
        to: "/local/page"
    });
}
```

## Fetch the page data

Now, let's fetch some data. First, add a [Mock Service Worker](https://mswjs.io/) (MSW) request handler to the local module:

```ts local-module/mocks/handlers.ts
import { HttpResponse, http, type HttpHandler } from "msw";

export const requestHandlers: HttpHandler[] = [
    http.get("/api/characters", async () => {
        return HttpResponse.json([{
            "id": 1,
            "name": "Rick Sanchez",
            "species": "Human"
        }, {
            "id": 2,
            "name": "Morty Smith",
            "species": "Human"
        }]);
    })
];
```

Then, register the request handler using the module registration function:

```tsx !#7 local-module/src/register.tsx
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

Then, update the `Page` component to fetch and render the data:

```tsx !#10-15 local-module/src/Page.tsx
import { useSuspenseQuery } from "@tanstack/react-query";

interface Character {
    id: number;
    name: string;
    species: string;
}

export function Page() {
    const { data: characters } = useSuspenseQuery({ queryKey: ["/api/characters"], queryFn: () => {
        const response = await fetch("/api/characters");
        const data = await response.json();

        return data;
    } });

    return (
        <div>
            {characters.map((x: Character) => {
                return (
                    <div key={x.id}>
                        <span>Id: {x.id}</span>
                        <span> - </span>
                        <span>Name: {x.name}</span>
                        <span> - </span>
                        <span>Species: {x.species}</span>
                    </div>
                );
            })}
        </div>
    );
}
```

The previous code sample uses [useSuspenseQuery](https://tanstack.com/query/latest/docs/react/reference/useSuspenseQuery) instead of [useQuery](https://tanstack.com/query/latest/docs/react/reference/useQuery). This enables an application to leverage a React [Suspense](https://react.dev/reference/react/Suspense) boundary to render a fallback element in a layout component while the data is being fetched:


```tsx !#7-9 host/src/RootLayout.tsx
import { Suspense } from "react";
import { Outlet } from "react-router-dom";

export function RootLayout() {
    return (
        <>
            <Suspense fallback={<div>Loading...</div>}>
                <Outlet />
            </Suspense>
        </>
    );
}
```

## Try it :rocket:

Start the local module in a development environment using the `dev-isolated` script. If you haven't completed the [Develop a module in isolation](./develop-a-module-in-isolation.md) guide, use the `dev` script instead and skip the part about React Query devtools. Then, navigate to the `/local/page` page. 

You should notice that the character's data is being fetch from the MSW request handler and rendered on the page. Additionally, you should notice that the React Query devtools are available (a ribbon at the bottom right corner).

#### Troubleshoot issues

If you are experiencing issues with this section of the guide:

- Open the [DevTools](https://developer.chrome.com/docs/devtools/) console. You'll find a log entry for each registration that occurs (including MSW request handlers) and error messages if something went wrong.
- Refer to a working example on [GitHub](https://github.com/gsoft-inc/wl-squide/tree/main/samples/endpoints).
- Refer to the [troubleshooting](../troubleshooting.md) page.
