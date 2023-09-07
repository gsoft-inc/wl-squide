---
order: 90
---

# Create a remote module

Remote modules are modules that are not included in the host application build but are instead **loaded at runtime** from a remote server. They provide a way for teams to be **fully autonomous** by **independently deploying** their modules without relying on the other parts of the application.

Let's add our first remote module!

## 1. Install the packages

Create a new project (we'll refer to ours as `remote-module`), then open a terminal at the root of the new solution and install the following packages:

pnpm add -D @workleap/webpack-configs @workleap/swc-configs webpack webpack-dev-server webpack-cli swc/core @swc/helpers browserslist postcss
pnpm add @squide/core @squide/react-router @squide/webpack-module-federation react react-dom react-router-dom

+++ pnpm
```bash
pnpm add -D @workleap/webpack-configs @workleap/swc-configs webpack webpack-dev-server webpack-cli swc/core @swc/helpers browserslist postcss
pnpm add @squide/core @squide/react-router @squide/webpack-module-federation react react-dom react-router-dom
```
+++ yarn
```bash
yarn add -D @workleap/webpack-configs @workleap/swc-configs webpack webpack-dev-server webpack-cli swc/core @swc/helpers browserslist postcss
yarn add @squide/core @squide/react-router @squide/webpack-module-federation react react-dom react-router-dom
```
+++ npm
```bash
npm install -D @workleap/webpack-configs @workleap/swc-configs webpack webpack-dev-server webpack-cli swc/core @swc/helpers browserslist postcss
npm install @squide/core @squide/react-router @squide/webpack-module-federation react react-dom react-router-dom
```
+++

## 2. Setup the application

### Application structure

First, create the following files:

```
remote-module
├── src
├──── register.tsx
├──── Page.tsx
├── webpack.dev.js
├── webpack.build.js
```

### Routes and navigation items registration

Then, register the remote module [routes](/reference/runtime/runtime-class.md#register-routes) and [navigation items](/reference/runtime/runtime-class.md#register-navigation-items):

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

## 3. Configure webpack

### development

To configure [webpack](https://webpack.js.org/) for a federated remote module application in **development** mode, use the [defineDevRemoteModuleConfig](/reference/webpack/defineDevRemoteModuleConfig.md) function:

```js !#6 remote-module/webpack.dev.js
// @ts-check

import { defineDevRemoteModuleConfig } from "@squide/webpack-module-federation/defineConfig.js";
import { swcConfig } from "./swc.dev.js";

export default defineDevRemoteModuleConfig(swcConfig, "remote1", 8081);
```

### build

To configure [webpack](https://webpack.js.org/) for a federated remote module application in **build** mode, use the [defineBuildRemoteModuleConfig](/reference/webpack/defineBuildRemoteModuleConfig.md) function:

```js !#6 remote-module/webpack.build.js
// @ts-check

import { defineBuildRemoteModuleConfig } from "@squide/webpack-module-federation/defineConfig.js";
import { swcConfig } from "./swc.build.js";

export default defineBuildRemoteModuleConfig(swcConfig, "remote1", "http://localhost:8081/");
```

## 4. Try the application :rocket:

Start both applications, and you should notice an additional link in the navigation menu. Click on the link to navigate to the page of your new remote module!
