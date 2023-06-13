---
order: 80
---

# Create a local module

Local modules are regular modules that are part of the **host application build**. They are independent modules that expose a `registration` function to the host application's bootstrapping code. A local module can be a standalone package, a sibling project (in a monorepo setup), or even a local folder within the host application.

Local modules are useful when migrating from a monolithic application to a distributed application or when launching a new product with an unrefined business domain.

Let's add a local module to demonstrate how it's done!

> Loading remote modules at runtime with [Webpack Module Federation](https://webpack.js.org/concepts/module-federation/) is the primary focus of this shell and our recommended approach. It empowers teams to be **fully autonomous** by **deploying** their modules **independently** from the other parts of the application.
>
> However, we recognize that teams working on mature products may prefer to **gradually migrate** to a distributed architecture by first extracting subdomains into independent modules within their current monolithic setup before fully committing to remote modules loaded at runtime.
>
> To facilitate this transition, this shell also supports local modules that are loaded at build time.
>
> Both remote and local modules can be used within same application as this shell supports dual bootstrapping. For example, an application can be configured to load a few remote modules at runtime while also loading a few local modules at build time.

## Install the packages

Create a new project (we'll refer to ours as `local-module`), then open a terminal at the root of the newly created project and install the following packages:

+++ pnpm
```bash
pnpm add @squide/core @squide/react-router react-router-dom
```
+++ yarn
```bash
yarn add @squide/core @squide/react-router react-router-dom
```
+++ npm
```bash
npm install @squide/core @squide/react-router react-router-dom
```
+++

## Setup the application

First, create the following files:

```
local-modules
├── src
├──── register.tsx
├──── Page.tsx
├── package.json
```

Then, add the following fields to the `package.json` files:

```json !#2,4 local-module/package.json
{
    "name": "@sample/local-module",
    "version": "0.0.1",
    "main": "dist/register.js"
}
```

Then, register the local module [routes](/references/runtime/runtime-class.md#register-routes) and [navigation items](/references/runtime/runtime-class.md#register-navigation-items):

```tsx !#8-13,15-20 local-module/src/register.tsx
import { lazy } from "react";
import { registerRoutes, registerNavigationItems, type ModuleRegisterFunction, type Runtime } from "@squide/react-router";
import type { AppContext } from "@sample/shared";

const Page = lazy(() => import("./Page"));

export const register: ModuleRegisterFunction = (runtime: Runtime, context: AppContext) => {
    runtime.registerRoutes([
        {
            path: "/local/page",
            element: <Page />
        }
    ]);

    runtime.registerNavigationItems([
        {
            to: "/local/page",
            content: "Local/Page"
        }
    ]);
}
```

```tsx local-module/src/Page.tsx
export default function Page() {
    return (
        <div>Hello from Local/Page!</div>
    )
}
```

## Register the local module

Go back to the `host` application and [register the local module](/references/registration/registerLocalModules.md). Don't forget to add a dependency in the host application `package.json` file.

```tsx !#5,27 host/src/bootstrap.tsx
import { createRoot } from "react-dom/client";
import { ConsoleLogger, RuntimeContext, Runtime } from "@squide/react-router";
import { registerRemoteModules, type RemoteDefinition } from "@squide/webpack-module-federation";
import type { AppContext } from "@sample/shared";
import { register as registerLocalModule } from "@sample/local-module";
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

// Register the local module.
registerLocalModule([registerLocalModule], runtime, context);

const root = createRoot(document.getElementById("root"));

root.render(
    <RuntimeContext.Provider value={runtime}>
        <App />
    </RuntimeContext.Provider>
);
```

## Try the application :rocket:

Start both applications, and you should now notice a third link in the navigation menu. Click on the link to navigate to the page of your new local module!
