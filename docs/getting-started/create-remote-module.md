---
order: 90
---

# Create a remote module

Remote modules are modules that are not part of the current build but are **loaded at runtime** from a remote server. They are useful because they enable teams to be **fully autonomous** by **deploying** their modules **independently** from the other parts of the application.

Let's add our first remote module!

## Install the packages

Create a new project (we'll call ours `remote-module`), then open a terminal at the root of the newly created project and install the following packages:

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

## Setup the application

First, create the following files:

```
remote-module
├── src
├──── register.tsx
├──── Page.tsx
├── webpack.config.js
```

Then, register the remote module [routes](/references/runtime/runtime-class.md#register-routes) and [navigation items](/references/runtime/runtime-class.md#register-navigation-items):

```tsx !#7-19 remote-module/src/register.tsx
import { lazy } from "react";
import { registerRoutes, registerNavigationItems, type ModuleRegisterFunction, type Runtime } from "@squide/react-router";

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

```tsx remote-module/src/Page.tsx
export default function Page() {
    return (
        <div>Hello from Remote/Page!</div>
    )
}
```

## Configure Webpack

To add Webpack [ModuleFederationPlugin](https://webpack.js.org/plugins/module-federation-plugin/) we'll use the [remoteTransformer](/references/webpack/remoteTransformer.md) function:

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

## Try the application :rocket:

Start both applications, you should now see an additional link in the navigation menu. Click on the link to navigate to your remote module page!