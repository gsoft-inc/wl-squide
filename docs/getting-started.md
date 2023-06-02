---
order: 90
icon: rocket
---

# Getting started

Welcome to the `@squide` documentation. This page will give you an [overview](#overview) of `@squide` and a [quick start](#quick-start) to configure a new federated application from nothing.

!!!warning The prefered way to create a new federated application for the [Workleap](https://workleap.com/) platform is by using our [foundry-cli](https://github.com/workleap/wl-foundry-cli).
+++ pnpm
```bash
pnpm create @workleap/project@latest <output-directory>
```
+++ yarn
```bash
yarn create @workleap/project@latest <output-directory>
```
+++ npm
```bash
npm create @workleap/project@latest <output-directory>
```
+++
!!!

## Overview

We built this shell to facilitate the adoption of federated applications at [Workleap](https://workleap.com/) by **enforcing patterns** that we believe will help feature teams successfully implement a distributed architecture.

The shell itself is a very thin [API layer](/references) on top of [Webpack Module Federation](https://webpack.js.org/concepts/module-federation/) and [React Router](https://reactrouter.com) with the goal of maximizing both libraries forces and staying as most as possible out of their ways.

### Webpack Module Federation

We identified **2 major problems** with frontend federated applications:
- How to prevent loading the same large dependencies twice when switching between *modules*?
- How to offer a cohesive experience that doesn't feels *modular*?

We believe [Webpack Module Federation](https://webpack.js.org/concepts/module-federation/) solves the first problem by offering a mecanism capable of **deduping at runtime** the **common dependencies shared** by the **host** application and the **remote** modules. 

With this mecanism in place, all federated parts of an application can now be loaded in the same [browsing context](https://developer.mozilla.org/en-US/docs/Glossary/Browsing_context) instead of nested browsing contexts (like [iframes](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe)). 

By sharing the same browsing context (e.g. the same [Document](https://developer.mozilla.org/en-US/docs/Web/API/Document), the same [Window object](https://developer.mozilla.org/en-US/docs/Web/API/Window), and the same [DOM](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model)), federated parts are now unified and **form a single application**, which solves the second issues.

With [Webpack Module Federation](https://webpack.js.org/concepts/module-federation/), we believe that we will be able to develop federated applications that feels like monolithic applications :rocket:

### React Router

React Router [nested routes](https://reactrouter.com/en/main/start/tutorial#nested-routes) feature is ideal for federated application as it makes the UI heavily composable and decoupled. Anyway, which else would you use? :joy:

### Module's registration

The most distinctive aspect of this shell is the conventions it enforce to load and register remote modules. Here's a rough idea of the flow:

1. At bootstrap, the host application will try to [load predefined modules](/references/registration/registerRemoteModules.md) and call a registration function matching a specific name and signature for each module that is successfully loaded.

2. During it's registration, a module will receive [the shared services](/references/runtime/runtime-instance.md) of the federation application and use them to dynamically register its [routes](/references/runtime/runtime-instance.md#register-routes) and [navigation items](/references/runtime/runtime-instance.md#register-navigation-items).

3. Once [all the remote modules are registered](/references/registration/useAreRemotesReady.md), the host application will create a React Router instance with the registered routes and [render a navigation menu](/references/routing/useRenderedNavigationItems.md) with the registered navigation items.

That's it in a nutshell. Of course, there's more to it, but those are the main ideas.

### Guiding principles

While developing the [API](/references) of `@squide`, we had a few guiding principles in mind. Those principles are not settled stones, you might want to diverge from them from time to time, but adhering to those will make your experience more enjoyable:

1. A module should always match a subdomain of the application business domain and should only export pages.

2. A module should be fully autonomous. It shouldn't have to coordinate with other parts of the application for things as trivial as navigation links.

3. A federated application should feel homogenous. Different parts of a federation application should have the ability to communicate with each others and react to changes happening outside of their boundaries.

4. Data and state should never be shared between parts of a federated application. Even if two parts needs the same data or the same state values, they should load, store and manage those independently.

## Quick start

### Prerequisites

Before going further make sure you:

- Installed at least the latest LTS version of [Node.js](https://nodejs.org/)
- Created a project for an host application (we'll call ours `host` in this tutorial)
- Created a project for a remote module application (we'll call ours `remote-module` in this tutorial)

### Install the packages

Open a terminal at the root of the **host application** project and install the following packages:

+++ pnpm
```bash
pnpm add @squide/core @squide/react-router @squide/webpack-module-federation webpack react-router-dom
```
+++ yarn
```bash
yarn add @squide/core @squide/react-router @squide/webpack-module-federation webpack react-router-dom
```
+++ npm
```bash
npm install @squide/core @squide/react-router @squide/webpack-module-federation webpack react-router-dom
```
+++

Then open a terminal at the root of every **remote module** project and install the following packages:

+++ pnpm
```bash
pnpm add @squide/core @squide/react-router @squide/webpack-module-federation webpack react-router-dom
```
+++ yarn
```bash
yarn add @squide/core @squide/react-router @squide/webpack-module-federation webpack react-router-dom
```
+++ npm
```bash
npm install @squide/core @squide/react-router @squide/webpack-module-federation webpack react-router-dom
```
+++

### Configure the host application

First, create the following files:

```
host
├── src
├──── App.tsx
├──── RootLayout.tsx
├──── Home.tsx
├──── bootstrap.tsx
├──── index.ts
├── webpack.config.js
```

Then, use dynamic import to add an async boundary to the host application:

```ts host/src.index.ts
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore doesn't support file extension.
import("./bootstrap");

// TS1208: 'index.tsx' cannot be compiled under '--isolatedModules' because it is considered a global script file. Add an import, export, or an
// empty 'export {}' statement to make it a module.
export {};
```

!!!info
To learn more about this async boundary and the `bootstrap.tsx` file, read the following [article](https://dev.to/infoxicator/module-federation-shared-api-ach#using-an-async-boundary).
!!!

Then, instanciate the shell [Runtime](/references/runtime/runtime-instance.md) and [register the remote module](/references/registration/registerRemoteModules.md) (the remote module application will be configured in the [next section](#configure-a-remote-application)):

```tsx !#12-14,17 host/src/bootstrap.tsx
import { createRoot } from "react-dom/client";
import { ConsoleLogger, RuntimeContext, Runtime } from "@squide/react-router";
import { registerRemoteModules, type RemoteDefinition } from "@squide/webpack-module-federation";
import { App } from "./App";

// Define the remote modules.
const Remotes: RemoteDefinition[] = [
    { url: "http://localhost:8081", name: "remote1" }
];

// Create the shell runtime.
const runtime = new Runtime({
    loggers: [new ConsoleLogger()]
});

// Register the remote module.
registerRemoteModules(Remotes, runtime);

const root = createRoot(document.getElementById("root"));

root.render(
    <RuntimeContext.Provider value={runtime}>
        <App />
    </RuntimeContext.Provider>
);
```

Next, [retrieve the routes](/references/runtime/useRoutes.md) registered by the remote module and create a router instance:

```tsx !#11,14 host/src/App.tsx
import { lazy, useMemo } from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { useRoutes } from "@squide/react-router";
import { useAreRemotesReady } from "@squide/webpack-module-federation";
import { RootLayout } from "./RootLayout";

const Home = lazy(() => import("./Home"));

export function App() {
    // Re-render the application once the remote modules are registered.
    const isReady = useAreRemotesReady();

    // Retrieve the routes registered by the remote modules.
    const routes = useRoutes(runtime);

    // Create the router instance with an home page and the remote module routes.
    const router = useMemo(() => {
        return createBrowserRouter([
            {
                path: "/",
                element: <RootLayout />,
                children: [
                    {
                        index: true,
                        element: <Home />
                    },
                    ...routes
                ]
            }
        ]);
    }, [routes]);

    // Display a loading until the remote modules are registered.
    if (!isReady) {
        return <Loading />;
    }

    // Render the router.
    return (
        <RouterProvider
            router={router}
            fallbackElement={<Loading />}
        />
    );
}
```

Then, create a layout component to [render the navigation items](/references/routing/useRenderedNavigationItems.md):

```tsx !#38,41 host/src/RootLayout.tsx
import type { ReactNode } from "react";
import { Link, Outlet } from "react-router-dom";
import { 
    useNavigationItems,
    useRenderedNavigationItems,
    isNavigationLink,
    type RenderItemFunction,
    type RenderSectionFunction
} from "@squide/react-router";

const renderItem: RenderItemFunction = (item, index, level) => {
    // To keep thing simple, this sample doesn't support nested navigation items.
    // For an example including support for nested navigation items, have a look at
    // https://workleap.github.io/wl-squide/references/routing/userenderednavigationitems/
    if (!isNavigationLink(item)) {
        return null;
    }

    return (
        <li key={`${level}-${index}`}>
            <Link {...linkProps} {...additionalProps}>
                {label}
            </Link>
        </li>
    );
};

const renderSection: RenderSectionFunction = (elements, index, level) => {
    return (
        <ul key={`${level}-${index}`}>
            {elements}
        </ul>
    );
};

export default function RootLayout() {
    // Retrieve the navigation items registered by the remote modules.
    const navigationItems = useNavigationItems();

    // Transform the navigation items into React elements.
    const navigationElements = useRenderedNavigationItems(navigationItems, renderItem, renderSection);

    return (
        <>
            <nav>{navigationElements}</nav>
            <Outlet />
        </>
    );
}
```

Finally, configure the [ModuleFederationPlugin](https://webpack.js.org/plugins/module-federation-plugin/) with the [hostTransformer](/references/webpack/hostTransformer.md) function:

```js !#8 host/webpack.config.js
import { hostTransformer } from "@squide/webpack-module-federation/configTransformer.js";

/** @type {import("webpack").Configuration} */
const webpackConfig = {
    ...
};

const federatedConfig = hostTransformer(config, "host");

export default federatedConfig;
```

[!ref target="blank" text="View a full webpack.config.js on Github"](https://github.com/workleap/wl-squide/blob/main/sample/host/webpack.dev.js)

### Configure a remote application

First, create the following files:

```
remote-module
├── src
├──── register.tsx
├──── Page.tsx
├── webpack.config.js
```

Then, register the remote module [routes](/references/runtime/runtime-instance.md#register-routes) and [navigation items](/references/runtime/runtime-instance.md#register-navigation-items):

```tsx !#7-19 remote-module/src/register.tsx
import { lazy } from "react";
import { registerRoutes, registerNavigationItems, type ModuleRegisterFunction, type Runtime } from "wmfnext-shell";

const Page = lazy(() => import("./Page"));

export const register: ModuleRegisterFunction = (runtime: Runtime) => {
    runtime.registerRoutes([
        {
            path: "/remote/page",
            element: <Page />
        }
    ]);

    runtime.registerNavigationItems([
        {
            to: "/remote/page",
            content: "Remote/Page"
        }
    ]);
}
```

Then, create the `Page` component:

```tsx # remote-module/src/Page.tsx
export default function Page() {
    return (
        <div>Hello from Remote/Page!</div>
    )
}
```

Finally, configure the [ModuleFederationPlugin](https://webpack.js.org/plugins/module-federation-plugin/) with the [remoteTransformer](/references/webpack/remoteTransformer.md) function:

```js !#8 remote-module/webpack.config.js
import { remoteTransformer } from "@squide/webpack-module-federation/configTransformer.js";

/** @type {import("webpack").Configuration} */
const config = {
    ...
};

const federatedConfig = remoteTransformer(config, "remote1");

export default federatedConfig;
```

[!ref target="blank" text="View a full webpack.config.js on Github"](https://github.com/workleap/wl-squide/blob/main/sample/remote-module/webpack.dev.js)
