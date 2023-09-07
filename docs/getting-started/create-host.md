---
order: 100
label: Create an host app
---

# Create an host application

Let's begin by creating the application that will serve as the entry point for our federated application and host the application modules.

## 1. Install the packages

Create a new project (we'll refer to ours as `host`), then open a terminal at the root of the new solution and install the following packages:

+++ pnpm
```bash
pnpm add -D webpack
pnpm add @squide/core @squide/react-router @squide/webpack-module-federation react-router-dom
```
+++ yarn
```bash
yarn add -D webpack
yarn add @squide/core @squide/react-router @squide/webpack-module-federation react-router-dom
```
+++ npm
```bash
npm install -D webpack
npm install @squide/core @squide/react-router @squide/webpack-module-federation react-router-dom
```
+++

## 2. Setup the application

### Application structure

First, create the following files:

```
host
├── src
├──── App.tsx
├──── RootLayout.tsx
├──── Home.tsx
├──── bootstrap.tsx
├──── index.ts
├── webpack.dev.js
├── webpack.build.js
```

### Async boundary

Then, use a dynamic import to add an async boundary:

```ts host/src/index.ts
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

### Module registration

Then, instanciate the shell [Runtime](/reference/runtime/runtime-class.md) and [register the remote module](/reference/registration/registerRemoteModules.md) (the configuration of the remote module will be covered in the [next section](create-remote-module.md)):

```tsx !#23,13-15,18-20 host/src/bootstrap.tsx
import { createRoot } from "react-dom/client";
import { ConsoleLogger, RuntimeContext, Runtime } from "@squide/react-router";
import { registerRemoteModules, type RemoteDefinition } from "@squide/webpack-module-federation";
import type { AppContext} from "@sample/shared";
import { App } from "./App.tsx";

// Define the remote modules.
const Remotes: RemoteDefinition[] = [
    { url: "http://localhost:8081", name: "remote1" }
];

// Create the shell runtime.
const runtime = new Runtime({
    loggers: [new ConsoleLogger()]
});

// Create an optional context.
const context: AppContext = {
    name: "Demo application"
};

// Register the remote module.
registerRemoteModules(Remotes, runtime, context);

const root = createRoot(document.getElementById("root"));

root.render(
    <RuntimeContext.Provider value={runtime}>
        <App />
    </RuntimeContext.Provider>
);
```

### Router instance

Then, [retrieve the routes](/reference/runtime/useRoutes.md) that have been registered by the remote module and create a router instance:

```tsx !#10,13,17 host/src/App.tsx
import { lazy, useMemo } from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { useRoutes } from "@squide/react-router";
import { useAreRemotesReady } from "@squide/webpack-module-federation";
import { RootLayout } from "./RootLayout.tsx";
import { Home } from "./Home.tsx";

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

```tsx host/src/Home.tsx
export function Home() {
    return (
        <div>Hello from the Home page!</div>
    )
}
```

### Navigation items

FInally, create a layout component to [render the navigation items](/reference/routing/useRenderedNavigationItems.md):

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
    // https://gsoft-inc.github.io/wl-squide/reference/routing/userenderednavigationitems/
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

## 3. Configure webpack

### development

To configure [webpack](https://webpack.js.org/) for a federated host application in **development** mode, use the [defineDevHostConfig](/reference/webpack/defineDevHostConfig.md) function:

```js !#6 host/webpack.dev.js
// @ts-check

import { defineDevHostConfig } from "@squide/webpack-module-federation/defineConfig.js";
import { swcConfig } from "./swc.dev.js";

export default defineDevHostConfig(swcConfig, "host", 8080);
```

### build

To configure [webpack](https://webpack.js.org/) for a federated host application in **build** mode, use the [defineBuildHostConfig](/reference/webpack/defineBuildHostConfig.md) function:

```js !#6 host/webpack.build.js
// @ts-check

import { defineBuildHostConfig } from "@squide/webpack-module-federation/defineConfig.js";
import { swcConfig } from "./swc.build.js";

export default defineBuildHostConfig(swcConfig, "host", "http://localhost:8080/");
```

## 4. Try the application :rocket:

Start the application, and you should see the home page. Even if the remote module application is not yet available, the host application will gracefully load.
