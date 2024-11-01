---
order: 80
---

# Create a local module

!!!info Use an existing template

We highly recommend going through the entire getting started guide. However, if you prefer to scaffold the application we'll be building, a template is available with [degit](https://github.com/Rich-Harris/degit):

```bash
corepack pnpm dlx degit https://github.com/gsoft-inc/wl-squide/templates/getting-started
```
!!!

Local modules are regular modules that are part of the **host application build**. They are independent modules that expose a `registration` function to the host application's bootstrapping code. A local module can be a standalone package, a sibling project (in a monorepo setup), or even a local folder within the host application.

Local modules have many uses but are especially useful when **launching** a **new product** with an unrefined business domain or **migrating** from a **monolithic application** to a distributed application.

Let's add a local module to demonstrate how it's done!

## Install the packages

Create a new application (we'll refer to ours as `local-module`), then open a terminal at the root of the new solution and install the following packages:

+++ pnpm
```bash
pnpm add -D @workleap/tsup-configs tsup typescript @types/react @types/react-dom
pnpm add @squide/firefly react react-dom react-router-dom @tanstack/react-query
```
+++ yarn
```bash
yarn add -D @workleap/tsup-configs tsup typescript @types/react @types/react-dom
yarn add @squide/firefly react @squide/firefly react-dom react-router-dom @tanstack/react-query
```
+++ npm
```bash
npm add -D @workleap/tsup-configs tsup typescript @types/react @types/react-dom
npm install @squide/firefly react react-dom react-router-dom @tanstack/react-query
```
+++

!!!warning
While you can use any package manager to develop an application with Squide, it is highly recommend that you use [PNPM](https://pnpm.io/) as the guides has been developed and tested with PNPM.
!!!

## Setup the application

First, create the following files:

```
local-modules
├── src
├──── register.tsx
├──── Page.tsx
├── tsup.dev.ts
├── tsup.build.ts
├── package.json
```

Then, ensure that you are developing your module using [ESM syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) by specifying `type: module` in your `package.json` file:

```json local-module/package.json
{
    "type": "module"
}
```

Finally, configure the package to be shareable by adding the `name`, `version`, and `export` fields to the `package.json` file:

```json local-module/package.json
{
    "name": "@getting-started/local-module",
    "version": "0.0.1",
    "exports": {
        ".": {
            "types": "./dist/register.d.ts",
            "import": "./dist/register.js",
            "default": "./dist/register.js"
        }
    }
}
```

### Routes registration

Next, register the local module routes and navigation items with [registerRoute](/reference/runtime/runtime-class.md#register-routes) and [registerNavigationItem](/reference/runtime/runtime-class.md#register-navigation-items) functions:

```tsx !#5-8,10-14 local-module/src/register.tsx
import type { ModuleRegisterFunction, FireflyRuntime } from "@squide/firefly";
import { Page } from "./Page.tsx";

export const register: ModuleRegisterFunction<FireflyRuntime> = runtime => {
    runtime.registerRoute({
        path: "/local/page",
        element: <Page />
    });

    runtime.registerNavigationItem({
        $id: "local-page",
        $label: "Local/Page",
        to: "/local/page"
    });
}
```

Then, create the `Page` component:

```tsx local-module/src/Page.tsx
export function Page() {
    return (
        <div>Hello from Local/Page!</div>
    );
}
```

## Register the local module

Go back to the `host` application and add a dependency to the `@getting-started/local-module` package in the host application `package.json` file:

```json host/package.json
{
    "dependencies": {
        "@getting-started/local-module": "0.0.1"
    }
}
```

!!!info
If your project is set up as a monorepo, use `workspace:*` for the version instead of `0.0.1`.
!!!

Then, register the local module with the [bootstrapping](/reference/registration/bootstrapping.md) function:

```tsx !#3,19 host/src/bootstrap.tsx
import { createRoot } from "react-dom/client";
import { ConsoleLogger, RuntimeContext, FireflyRuntime, bootstrap, type RemoteDefinition } from "@squide/firefly";
import { register as registerMyLocalModule } from "@getting-started/local-module";
import { App } from "./App.tsx";
import { registerHost } from "./register.tsx";

// Define the remote modules.
const Remotes: RemoteDefinition[] = [
    { name: "remote1" }
];

// Create the shell runtime.
const runtime = new FireflyRuntime({
    loggers: [x => new ConsoleLogger(x)]
});

// Register the modules.
await bootstrap(runtime, {
    localModules: [registerHost, registerMyLocalModule],
    remotes: Remotes
})

const root = createRoot(document.getElementById("root")!);

root.render(
    <RuntimeContext.Provider value={runtime}>
        <App />
    </RuntimeContext.Provider>
);
```

## Configure tsup

!!!info
If you are having issues with the tsup configuration, refer to the [@workleap/tsup-configs](https://gsoft-inc.github.io/wl-web-configs/tsup) documentation.
!!!

### Development configuration

To configure tsup for a **development** environment, open the `tsup.dev.ts` file and copy/paste the following code:

```ts local-module/tsup.dev.ts
import { defineDevConfig } from "@workleap/tsup-configs";

export default defineDevConfig();
```

### Build configuration

To configure tsup for a **build** environment, open the `tsup.build.ts` file and copy/paste the following code:

```ts local-module/tsup.build.ts
import { defineBuildConfig } from "@workleap/tsup-configs";

export default defineBuildConfig();
```

## Add CLI scripts

To initiate the development server, add the following script to the application `package.json` file:

```json local-module/package.json
{
    "dev": "tsup --config ./tsup.dev.ts"
}
```

To build the module, add the following script to the application `package.json` file:

```json local-module/package.json
{
    "build": "tsup --config ./tsup.build.ts"
}
```

## Try it :rocket:

Start the `host`, `remote-module` and `local-module` applications in development mode using the `dev` script. You should notice an additional link labelled `Local/Page` in the navigation menu. Click on the link to navigate to the page of your new **local** module!

### Troubleshoot issues

If you are experiencing issues with this guide:

- Open the [DevTools](https://developer.chrome.com/docs/devtools/) console. You'll find a log entry for each registration that occurs and error messages if something went wrong:
    - `[squide] The following route has been registered.`
    - `[squide] The following static navigation item has been registered to the "root" menu for a total of 2 static items.`
- Refer to a working example on [GitHub](https://github.com/gsoft-inc/wl-squide/tree/main/samples/basic/local-module).
- Refer to the [troubleshooting](../troubleshooting.md) page.
