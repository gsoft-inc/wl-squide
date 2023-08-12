---
order: 90
---

# Create a remote module

Remote modules are modules that are not included in the host application build but are instead **loaded at runtime** from a remote server. They provide a way for teams to be **fully autonomous** by **independently deploying** their modules without relying on the other parts of the application.

Let's add our first remote module!

## 1. Install the packages

Create a new project (we'll refer to ours as `remote-module`), then open a terminal at the root of the new solution and install the following packages:

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

### File structure

First, create the following files:

```
remote-module
├── src
├──── register.tsx
├──── Page.tsx
├── webpack.config.js
```

### Routes and navigation items registration

Then, register the remote module [routes](/references/runtime/runtime-class.md#register-routes) and [navigation items](/references/runtime/runtime-class.md#register-navigation-items):

```tsx !#8-13,15-20 remote-module/src/register.tsx
import { lazy } from "react";
import { registerRoutes, registerNavigationItems, type ModuleRegisterFunction, type Runtime } from "@squide/react-router";
import type { AppContext } from "@sample/shared";

const Page = lazy(() => import("./Page"));

export const register: ModuleRegisterFunction = (runtime: Runtime, context: AppContext) => {
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

## 3. Configure Webpack

To configure the Webpack [ModuleFederationPlugin](https://webpack.js.org/plugins/module-federation-plugin/), use the [remoteTransformer](/references/webpack/remoteTransformer.md) function:

```js !#8 remote-module/webpack.config.js
import { remoteTransformer } from "@squide/webpack-module-federation/configTransformer.js";

/** @type {import("webpack").Configuration} */
const config = {
    ...
};

const federatedConfig = remoteTransformer(config, "remote1");

export default federatedConfig;
```

[!ref icon="mark-github" text="View a full webpack.config.js on Github"](https://github.com/gsoft-inc/wl-squide/blob/main/sample/remote-module/webpack.dev.js)

## 4. Try the application :rocket:

Start both applications, and you should notice an additional link in the navigation menu. Click on the link to navigate to the page of your new remote module!
