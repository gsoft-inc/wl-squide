---
order: 50
toc:
    depth: 2-4
---

# Develop a module in isolation

To develop their own independent module, a team **shouldn't be required to install the host application** or any **other modules** of the application **that they do not own**. However, they should have a means to integrate their module with the application shell (`RootLayout`, `RootErrorBoundary`, etc..) while working on their module in isolation.

To achieve this, the first step is to extract the application shell from the host application. There are several approaches to accomplish this, but in this guide, we'll transform the host application into a monorepo and introduce a new local package named `@sample/shell` for this purpose:

``` !#4
host
├── packages
├────── app
├────── shell
├───────── src
├─────────── RootLayout.tsx
├─────────── RootErrorBoundary.tsx
├─────────── useAppRouter.ts
├─────────── index.ts
├───────── package.json
├───────── tsup.dev.ts
├───────── tsup.build.ts
```

## Shell package

> The implementation details of the `RootLayout` and `RootErrorBoundary` won't be covered by this guide as it already has been covered many times by other guides.

### package.json

First, add the following fields to the `package.json` file:

```json shell/package.json
{
    "name": "@sample/shell",
    "version": "0.0.1",
    "type": "module",
    "exports": {
        ".": {
            "import": "./dist/index.js",
            "types": "./dist/index.d.ts",
            "default": "./dist/index.js"
        }
    }
}
```

### Setup the package

Then, install the package dependencies and configure the new package with [tsup](https://gsoft-inc.github.io/wl-web-configs/tsup/).

### Create useAppRouter

Finally, add a `useAppRouter` hook to the shell package. Its purpose is to provide a **reusable router configuration** that can be utilized by both the host application and the isolated modules. By using this hook, modules developed in isolation can utilize the **same application shell and routing configuration** as the host application. 

```tsx shell/src/useAppRouter.tsx
import { useMemo, useState } from "react";
import { createBrowserRouter } from "react-router-dom";
import { Route, useRoutes } from "@squide/react-router";
import { RootErrorBoundary } from "./RootErrorBoundary";
import { RootLayout } from "./RootLayout";

export interface UseAppRouterOptions {
    rootRoutes?: Route[];
}

export function useAppRouter({ rootRoutes = [] }: UseAppRouterOptions = {}) {
    // Reuse the same array reference through re-renders.
    const [memoizedRootRoutes] = useState(rootRoutes);

    const routes = useRoutes();

    const router = useMemo(() => {
        return createBrowserRouter([
            {
                element: <RootLayout />,
                children: [
                    {
                        errorElement: <RootErrorBoundary />,
                        children: [
                            ...routes
                        ]
                    }
                ]
            },
            ...memoizedRootRoutes
        ]);
    }, [routes, memoizedRootRoutes]);

    return router;
}
```

!!!info
This guide only covers the `RootLayout` and `RootErrorBoundary` but the same goes for other shell assets such as an `AuthenticationBoundary`.
!!!

### Sample

For a functional sample of an application shell with a `useAppRouter` hook, have a look at the `/shell` folder of the `@sample/shared` package of the `@squide` sandbox on [GitHub](https://github.com/gsoft-inc/wl-squide/tree/main/sample/shared/src/shell).

## Host application

### Add the shell dependency

Now, let's revisit the host application by first adding a dependency to the new `@sample/shell` package:

```json host/package.json
{
    "dependencies": {
        "@sample/shell": "0.0.1"
    }
}
```

### Incorporate useAppRouter

Then, incorporate the newly introduced `useAppRouter` hook:

```tsx !#9-16 host/src/App.tsx
import { RouterProvider } from "react-router-dom";
import { useAreRemotesReady } from "@squide/webpack-module-federation";
import { useAppRouter } from "@sample/shell";
import { Home } from "./Home.tsx";

export function App() {
    const isReady = useAreRemotesReady();

    const router = useAppRouter({
        rootRoutes: [
            {
                index: true,
                element: <Home />
            }
        ]
    });

    if (!isReady) {
        return <div>Loading...</div>;
    }

    return (
        <RouterProvider
            router={router}
            fallbackElement={<div>Loading...</div>}
        />
    );
}
```

## Remote module

With our new setup in place, we can now configure the remote module to be developed in isolation. The goal is to start the module development server and render the module pages with the same layout and functionalities as if it was rendered by the host application.

### Add the shell dependency

To begin, let's start by adding a dependencies to the `@sample/shell` package:

```json remote-module/package.json
{
    "dependencies": {
        "@sample/shell": "0.0.1"
    }
}
```

### Add new files

Then, add the `index.tsx`, `App.tsx`, `DevHome.tsx`, and `webpack.dev.js` files to the remote module application:

``` !#5-8
remote-module
├── src
├────── register.tsx
├────── Page.tsx
├────── DevHome.tsx
├────── index.tsx
├────── App.tsx
├── webpack.dev.js
├── package.json
```

### index.tsx

The `index.tsx` file is similar to the `bootstrap.tsx` file of an host application but, tailored for an isolated module. The key distinction is that, since the project is set up for local development, the module is registered with the [registerLocalModules](/reference/registration/registerLocalModules.md) function instead of the [registerRemoteModules](/reference/registration/registerRemoteModules.md) function:

```tsx !#8-10,14 remote-module/src/index.tsx
import { createRoot } from "react-dom/client";
import { ConsoleLogger, RuntimeContext, Runtime, registerLocalModules } from "@squide/react-router";
import { App } from "./App.tsx";
import { register } from "./register.tsx";

// Create the shell runtime.
// Services, loggers and sessionAccessor could be reuse through a shared packages or faked when in isolation.
const runtime = new Runtime({
    loggers: [new ConsoleLogger()]
});

// Registering the remote module as a static module because the "register" function 
// is local when developing in isolation.
registerLocalModules([register], runtime);

const root = createRoot(document.getElementById("root"));

root.render(
    <RuntimeContext.Provider value={runtime}>
        <Suspense fallback={<div>Loading...</div>}>
            <App />
        </Suspense>
    </RuntimeContext.Provider>
);
```

### App.tsx

The `App.tsx` file uses the newly created `useAppRouter` hook to setup [React Router](https://reactrouter.com/) with the `<RootLayout>`, the `<RootErrorBoundary>` and the other shell assets:

```tsx !#6-13 remote-module/src/App.tsx
import { RouterProvider } from "react-router-dom";
import { useAppRouter } from "@sample/shell";
import { DevHome } from "./DevHome.tsx";

export function App() {
    const router = useAppRouter({
        rootRoutes: [
            {
                index: true,
                element: <DevHome />
            }
        ]
    });

    return (
        <RouterProvider
            router={router}
            fallbackElement={<div>Loading...</div>}
        />
    );
}
```

### DevHome.tsx

The `<DevHome>` component purpose is strictly to serve as an `index` page when developing the remote module in isolation.

```tsx remote-module/src/DevHome.tsx
function DevHome() {
    return (
        <div>
            <h2>Remote module development home page</h2>
            <p>Hey!</p>
        </div>
    );
}
```

### dev-local script

Next, add a new `dev-local` script to the `package.json` file to start the local development server in **"isolation"**:

```json !#3 remote-module/package.json
{
    "dev": "webpack serve --config webpack.dev.js",
    "dev-local": "cross-env LOCAL=true webpack serve --config webpack.dev.js",
}
```

The `dev-local` script is similar to the `dev` script but introduces a `LOCAL` environment variable. This new environment variable will be utilized by the `webpack.dev.js` file to conditionally setup the development server for **local** development in **isolation** or to be consumed by a host application through the `/remoteEntry.js` entry point:

### Configure webpack

To configure webpack, open the `webpack.dev.js` file and update the configuration to incorporate the `LOCAL` environment variable:

```js !#9,12 remote-module/webpack.dev.js
// @ts-check

import { defineDevRemoteModuleConfig } from "@squide/webpack-module-federation/defineConfig.js";
import { defineDevConfig } from "@workleap/webpack-configs";
import { swcConfig } from "./swc.dev.js";

let config;

if (!process.env.LOCAL) {
    config = defineDevRemoteModuleConfig(swcConfig, "remote1", 8081);
} else {
    config = defineDevConfig(swcConfig);
}

export default config;
```

### Try it :rocket:

Start the remote module in isolation by running the `dev-local` script. The application shell should wrap the pages of the module and the default page should be `<DevHome>`.

### Sample application

For a functional sample of a **remote** module application with an isolated development environment, have a look at the `@sample/remote-module` application of the `@squide` sandbox on [GitHub](https://github.com/gsoft-inc/wl-squide/tree/main/sample/remote-module).

## Local module

Similarly to remote modules, the same isolated setup can be achieved for local modules. The main difference is that the `webpack.config.js` file of a local module serves the sole purpose of starting a development server for isolated development. Typically, local modules do not rely on webpack and [Module Federation](https://webpack.js.org/concepts/module-federation/).

### Install the packages

First, open a terminal at the root of the local module application and install the `@workleap/webpack-configs` package and its dependencies:

+++ pnpm
```bash
pnpm add -D @workleap/webpack-configs @workleap/swc-configs @workleap/browserslist-config webpack webpack-dev-server webpack-cli @swc/core @swc/helpers browserslist postcss
```
+++ yarn
```bash
yarn add -D @workleap/webpack-configs @workleap/swc-configs @workleap/browserslist-config webpack webpack-dev-server webpack-cli @swc/core @swc/helpers browserslist postcss
```
+++ npm
```bash
npm install -D @workleap/webpack-configs @workleap/swc-configs @workleap/browserslist-config webpack webpack-dev-server webpack-cli @swc/core @swc/helpers browserslist postcss
```
+++

### Add new files

Then, add the following files to the local module application:

``` !#2-3,7-12
local-module
├── public
├────── index.html
├── src
├────── register.tsx
├────── Page.tsx
├────── DevHome.tsx
├────── index.tsx
├────── App.tsx
├── .browserslistrc
├── swc.config.js
├── webpack.config.js
├── package.json
```

### index.tsx

This file is similar to the `index.tsx` file of the [remote module](#indextsx).

### App.tsx

This file is similar to the `App.tsx` file of the [remote module](#apptsx).

### DevHome.tsx

This file is similar to the `DevHome.tsx` file of the [remote module](#devhometsx).

### Configure webpack

!!!info
If you are having issues configuring webpack, refer to the [@workleap/webpack-configs](https://gsoft-inc.github.io/wl-web-configs/webpack/) documentation website.
!!!

#### HTML template

First, open the `public/index.html` file and copy/paste the following [HtmlWebpackPlugin](https://webpack.js.org/plugins/html-webpack-plugin/) template:

```html local-module/public/index.html
<!DOCTYPE html>
<html>
    <head>
    </head>
    <body>
        <div id="root"></div>
    </body>
</html>
```

#### Browserslist

Then, open the `.browserslist` file and copy/paste the following content:

``` local-module/.browserslistrc
extends @workleap/browserslist-config
```

#### SWC

Then, open the `swc.config.js` file and copy/paste the following code:

```js local-module/swc.config.js
// @ts-check

import { browserslistToSwc, defineDevConfig } from "@workleap/swc-configs";

const targets = browserslistToSwc();

export const swcConfig = defineDevConfig(targets);
```

#### webpack configuration

Finally, open the `webpack.config.js` file and use the the [defineDevRemoteModuleConfig](/reference/webpack/defineDevRemoteModuleConfig.md) function to configure webpack:

```js local-module/webpack.config.js
// @ts-check

import { defineDevConfig } from "@workleap/webpack-configs";
import { swcConfig } from "./swc.config.js";

export default defineDevConfig(swcConfig);
```

### dev-local script

Next, add a new `dev-local` script to the `package.json` file to start the local development server:

```json local-module/package.json
{
    "dev-local": "webpack serve --config webpack.config.js"
}
```

### Try it :rocket:

Start the remote module in isolation by running the `dev-local` script. The application shell should wrap the pages of the module and the default page should be `<DevHome>`.

### Sample application

For a functional sample of a **local** module application with an isolated development environment, have a look at the `@sample/local-module` application of the `@squide` sandbox on [GitHub](https://github.com/gsoft-inc/wl-squide/tree/main/sample/local-module).
