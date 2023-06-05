---
order: 80
---

# Create a local module

Local modules are useful when migrating from a monolithic application to a distributed application or when launching a new product with a small team and an unrefined business domain.

Let's add one to show how it's done!

> Loading *remote modules* at runtime with [Webpack Module Federation](https://webpack.js.org/concepts/module-federation/) is the reason why this shell exists and it is what we recommend products to aim for. It enables teams to be **fully autonomous** by **deploying** their modules **independently** from the other parts of the application.
>
> However, we understand that teams working on mature products will most likely prefer to **gradually migrate** towards a distributed architecture by first extracting subdomains into independent modules in their current monolithic setup before fully committing to remote modules loaded at runtime.
>
> To facilitate the transition, this shell also supports *local modules* loaded at build time.
>
> A *local module* is a regular module which is part of the **current build** and expose a `registration` function. A registration function could be imported from a standalone package, a sibling project in a monorepo setup, or even a local folder of the host application.
>
> Both remote and local modules can be used in the same application as this shell supports dual bootstrapping. For example, an application could be configured to load a few *remote modules* at runtime and also load a few *local modules* at build time.

## Install the packages

Create a new project (we'll call ours `local-module`), then open a terminal at the root of the newly created project and install the following packages:

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

Then, register the local module [routes](/references/runtime/runtime-instance.md#register-routes) and [navigation items](/references/runtime/runtime-instance.md#register-navigation-items):

```tsx !#7-19 local-module/src/register.tsx
import { lazy } from "react";
import { registerRoutes, registerNavigationItems, type ModuleRegisterFunction, type Runtime } from "wmfnext-shell";

const Page = lazy(() => import("./Page"));

export const register: ModuleRegisterFunction = (runtime: Runtime) => {
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

## Load the local module

Go back to the `host` application and [load the local module](/references/registration/registerLocalModules.md). Don't forget to add a dependency in the host application `package.json` file.

```tsx !#4,21 host/src/bootstrap.tsx
import { createRoot } from "react-dom/client";
import { ConsoleLogger, RuntimeContext, Runtime } from "@squide/react-router";
import { registerRemoteModules, type RemoteDefinition } from "@squide/webpack-module-federation";
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

// Register the remote module.
registerRemoteModules(Remotes, runtime);

// Register the local module.
registerLocalModule([registerLocalModule], runtime);

const root = createRoot(document.getElementById("root"));

root.render(
    <RuntimeContext.Provider value={runtime}>
        <App />
    </RuntimeContext.Provider>
);
```

## Try the application :rocket:

Start both applications, you should now see a third link in the navigation menu. Click on the link to navigate to your local module page!
