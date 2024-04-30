---
order: 800
---

# Develop a module in isolation

To develop their own independent module, a team **shouldn't be required to install the host application** or any **other modules** of the application **that they do not own**. However, they should have a means to integrate their module with the application shell (`RootLayout`, `RootErrorBoundary`, etc..) while working on their module in isolation.

To achieve this, the first step is to extract the application shell from the host application. There are several approaches to accomplish this, but in this guide, we'll transform the host application into a monorepo and introduce a new local package named `@sample/shell` for this purpose:

``` !#4
host
├── app
├── packages
├────── shell
├───────── src
├─────────── RootLayout.tsx
├─────────── RootErrorBoundary.tsx
├─────────── AppRouter.ts
├─────────── register.tsx
├─────────── index.ts
├───────── package.json
├───────── tsup.dev.ts
├───────── tsup.build.ts
```

## Create a shell package

> The implementation details of the `RootLayout` and `RootErrorBoundary` won't be covered by this guide as it already has been covered many times by other guides.

First, create a new package (we'll refer to ours as `shell`) and add the following fields to the `package.json` file:

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

Then, install the package dependencies and configure the new package with [tsup](https://gsoft-inc.github.io/wl-web-configs/tsup/).

Then, create a `AppRouter` component in the shell package to provide a **reusable router configuration** that can be utilized by both the host application and the isolated modules. The new `AppRouter` component should be based on the `@squide/firefly` [AppRouter](../reference/routing/appRouter.md) component:

```tsx shell/src/AppRouter.tsx
import { AppRouter as FireflyAppRouter } from "@squide/firefly";

export function AppRouter() {
    return (
        <FireflyAppRouter
            fallbackElement={<div>Loading...</div>}
            errorElement={<div>An error occured!</div>}
            waitForMsw={false}
        />
    );
}
```

Finally, create a local module to register the **application shell** that will also be utilized by the host application and the isolated modules:

```tsx shell/src/register.tsx
import { ManagedRoutes, type ModuleRegisterFunction, type FireflyRuntime } from "@squide/firefly";
import { RootLayout } from "./RootLayout.tsx";
import { RootErrorBoundary } from "./RootErrorBoundary.tsx";

export const registerShell: ModuleRegisterFunction<FireflyRuntime> = runtime => {
    runtime.registerRoute({
        element: <RootLayout />,
        children: [
            {
                errorElement: <RootErrorBoundary />,
                children: [
                    ManagedRoutes
                ]
            }
        ]
    }, {
        hoist: true
    });
};
```

!!!info
This guide only covers the `RootLayout` and `RootErrorBoundary` but the same goes for other shell assets such as an `AuthenticationBoundary`.
!!!

## Update the host application

Now, let's revisit the host application by first adding a dependency to the new `@sample/shell` package:

```json host/package.json
{
    "dependencies": {
        "@sample/shell": "0.0.1"
    }
}
```

Then, incorporate the newly introduced `AppRouter` component:

```tsx host/src/App.tsx
import { AppRouter } from "@sample/shell";

export function App() {
    return (
        <AppRouter />
    );
}
```

And the `registerShell` function to setup the `RootLayout`, the `RootErrorBoundary` and any other shell assets:

```tsx !#21 host/src/bootstrap.tsx
import { createRoot } from "react-dom/client";
import { ConsoleLogger, RuntimeContext, FireflyRuntime, registerRemoteModules, type RemoteDefinition } from "@squide/firefly";
import type { AppContext} from "@sample/shared";
import { App } from "./App.tsx";
import { registerHost } from "./register.tsx";
import { registerShell } from "@sample/shell";

const Remotes: RemoteDefinition[] = [
    { name: "remote1" }
];

const runtime = new FireflyRuntime({
    loggers: [new ConsoleLogger()]
});

const context: AppContext = {
    name: "Demo application"
};

// Register the newly created shell module.
await registerLocalModules([registerShell, registerHost], runtime, { context });

await registerRemoteModules(Remotes, runtime, { context });

const root = createRoot(document.getElementById("root")!);

root.render(
    <RuntimeContext.Provider value={runtime}>
        <App />
    </RuntimeContext.Provider>
);
```

## Setup a remote module

With the new `shell` package in place, we can now configure the remote module to be developed in isolation. The goal is to start the module development server and render the module pages with the same layout and functionalities as if it was rendered by the host application.

To begin, let's start by adding a dependency to the `@sample/shell` package:

```json remote-module/package.json
{
    "dependencies": {
        "@sample/shell": "0.0.1"
    }
}
```

Then, create the following files in the remote module application:

``` !#2-3,5-7,10-11
remote-module
├── public
├──── index.html
├── src
├────── dev
├────────── DevHome.tsx
├────────── register.tsx
├────── register.tsx
├────── Page.tsx
├────── index.tsx
├────── App.tsx
├── webpack.dev.js
├── package.json
```

### index.tsx

The `index.tsx` file is similar to the `bootstrap.tsx` file of an host application but, tailored for an isolated module. The key distinctions are that the module is registered with the [registerLocalModules](/reference/registration/registerLocalModules.md) function instead of the [registerRemoteModules](/reference/registration/registerRemoteModules.md) function, and a new `registerDev` function is introduced to register the development homepage (which will be covered in an upcoming section):

```tsx !#10-12,16 remote-module/src/index.tsx
import { createRoot } from "react-dom/client";
import { ConsoleLogger, RuntimeContext, FireflyRuntime, registerLocalModules } from "@squide/firefly";
import { App } from "./App.tsx";
import { register as registerModule } from "./register.tsx";
import { registerDev } from "./dev/register.tsx";
import { registerShell } from "@sample/shell";

// Services, loggers, sessionAccessor, etc... could be reuse through a
// shared packages or faked when in isolation.
const runtime = new FireflyRuntime({
    loggers: [new ConsoleLogger()]
});

// Registering the remote module as a static module because the "register" function 
// is local when developing in isolation.
await registerLocalModules([registerModule, registerDev, registerShell], runtime);

const root = createRoot(document.getElementById("root")!);

root.render(
    <RuntimeContext.Provider value={runtime}>
        <App />
    </RuntimeContext.Provider>
);
```

### App.tsx

The `App.tsx` file uses the newly created `AppRouter` component to setup [React Router](https://reactrouter.com/):

```tsx remote-module/src/App.tsx
import { AppRouter } from "@sample/shell";

export function App() {
    return (
        <AppRouter />
    );
}
```

### DevHome.tsx

The `DevHome` component purpose is strictly to serve as an `index` page when developing the remote module in isolation.

```tsx remote-module/src/dev/DevHome.tsx
function DevHome() {
    return (
        <div>
            <h2>Remote module development home page</h2>
            <p>Hey!</p>
        </div>
    );
}
```

To register the development homepage, let's create a new local module specifically for registering what is needed to develop the module in isolation:

```tsx remote-module/src/dev/register.tsx
import type { ModuleRegisterFunction, FireflyRuntime } from "@squide/firefly";
import { DevHome } from "./DevHome.tsx";

export const registerDev: ModuleRegisterFunction<FireflyRuntime> = runtime => {
    runtime.registerRoute({
        index: true,
        element: <DevHome />
    });
}
```

### Add a new CLI script

Next, add a new `dev-isolated` script to the `package.json` file to start the local development server in **"isolation"**:

```json !#3 remote-module/package.json
{
    "dev": "webpack serve --config webpack.dev.js",
    "dev-isolated": "cross-env ISOLATED=true webpack serve --config webpack.dev.js",
}
```

!!!info
If your project's `package.json` file does not already include the [cross-env](https://www.npmjs.com/package/cross-env) dependency, be sure to install `cross-env` as a development dependency.
!!!

The `dev-isolated` script is similar to the `dev` script but introduces a `ISOLATED` environment variable. This new environment variable will be utilized by the `webpack.dev.js` file to conditionally setup the development server for development in **isolation** or to be consumed by a host application through the `/remoteEntry.js` entry point:

### Configure webpack

!!!info
If you are having issues configuring webpack, refer to the [@workleap/webpack-configs](https://gsoft-inc.github.io/wl-web-configs/webpack/) documentation website.
!!!

First, open the `public/index.html` file created at the beginning of this guide and copy/paste the following [HtmlWebpackPlugin](https://webpack.js.org/plugins/html-webpack-plugin/) template:

```html host/public/index.html
<!DOCTYPE html>
<html>
    <head>
    </head>
    <body>
        <div id="root"></div>
    </body>
</html>
```

Then, open the `.browserslist` file and copy/paste the following content:

``` host/.browserslistrc
extends @workleap/browserslist-config
```

#### Isolated environment configuration

To configure webpack, open the `webpack.dev.js` file and update the configuration to incorporate the `ISOLATED` environment variable and the [defineDevHostConfig](../reference/webpack/defineDevHostConfig.md) function:

```js !#8,11 remote-module/webpack.dev.js
// @ts-check

import { defineDevRemoteModuleConfig, defineDevHostConfig } from "@squide/firefly-configs";
import { swcConfig } from "./swc.dev.js";

let config;

if (!process.env.ISOLATED) {
    config = defineDevRemoteModuleConfig(swcConfig, "remote1", 8081);
} else {
    config = defineDevHostConfig(swcConfig, "remote1", 8080, []);
}

export default config;
```

### Try it :rocket:

Start the remote module in isolation by running the `dev-isolated` script. The application shell should wrap the pages of the module and the default page should be `DevHome`.

#### Troubleshoot issues

If you are experiencing issues with this section of the guide:

- Open the [DevTools](https://developer.chrome.com/docs/devtools/) console. You'll find a log entry for each registration that occurs and error messages if something went wrong.
- Refer to a working example on [GitHub](https://github.com/gsoft-inc/wl-squide/tree/main/samples/basic/remote-module).
- Refer to the [troubleshooting](../troubleshooting.md) page.

## Setup a local module

Similarly to remote modules, the same isolated setup can be achieved for local modules. The main difference is that the `webpack.config.js` file of a local module serves the sole purpose of starting a development server for isolated development. Typically, local modules do not rely on webpack and [Module Federation](https://module-federation.io/).

First, open a terminal at the root of the local module application and install the `@squide/firefly-configs` package and its dependencies:

+++ pnpm
```bash
pnpm add -D @workleap/webpack-configs @workleap/swc-configs @workleap/browserslist-config @squide/firefly-configs webpack webpack-dev-server webpack-cli @swc/core @swc/helpers browserslist postcss
```
+++ yarn
```bash
yarn add -D @workleap/webpack-configs @workleap/swc-configs @workleap/browserslist-config @squide/firefly-configs webpack webpack-dev-server webpack-cli @swc/core @swc/helpers browserslist postcss
```
+++ npm
```bash
npm install -D @workleap/webpack-configs @workleap/swc-configs @workleap/browserslist-config @squide/firefly-configs webpack webpack-dev-server webpack-cli @swc/core @swc/helpers browserslist postcss
```
+++

!!!warning
While you can use any package manager to develop an application with Squide, it is highly recommended that you use [PNPM](https://pnpm.io/) as the guides has been developed and tested with PNPM.
!!!

Then, add a peer dependency and a dev dependency to the `@sample/shell` package:

```json local-module/package.json
{
    "peerDependencies": {
        "@sample/shell": "*"
    },    
    "devDependencies": {
        "@sample/shell": "0.0.1"
    }
}
```

Then, create the following files in the local module application:

``` !#2-3,5-7,10-11
local-module
├── public
├────── index.html
├── src
├────── dev
├────────── DevHome.tsx
├────────── register.tsx
├────── register.tsx
├────── Page.tsx
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

### DevHome.tsx and registerDev

These files are similar to the `dev/DevHome.tsx` and `dev/register.tsx` files of the [remote module](#devhometsx).

### Configure webpack

!!!info
If you are having issues configuring webpack, refer to the [@workleap/webpack-configs](https://gsoft-inc.github.io/wl-web-configs/webpack/) documentation website.
!!!

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

Then, open the `.browserslist` file and copy/paste the following content:

``` local-module/.browserslistrc
extends @workleap/browserslist-config
```

Then, open the `swc.config.js` file and copy/paste the following code:

```js local-module/swc.config.js
// @ts-check

import { browserslistToSwc, defineDevConfig } from "@workleap/swc-configs";

const targets = browserslistToSwc();

export const swcConfig = defineDevConfig(targets);
```

Finally, open the `webpack.config.js` file and use the the [defineDevHostConfig](../reference/webpack/defineDevHostConfig.md) function to configure webpack:

```js local-module/webpack.config.js
// @ts-check

import { defineDevHostConfig } from "@squide/firefly-configs";
import { swcConfig } from "./swc.config.js";

export default defineDevHostConfig(swcConfig, "local1", 8080, []);
```

### Add a new CLI script

Next, add a new `dev-isolated` script to the `package.json` file to start the local development server:

```json local-module/package.json
{
    "dev-isolated": "webpack serve --config webpack.config.js"
}
```

### Try it :rocket:

Start the remote module in isolation by running the `dev-isolated` script. The application shell should wrap the pages of the module and the default page should be `DevHome`.

#### Troubleshoot issues

If you are experiencing issues with this section of the guide:

- Open the [DevTools](https://developer.chrome.com/docs/devtools/) console. You'll find a log entry for each registration that occurs and error messages if something went wrong.
- Refer to a working example on [GitHub](https://github.com/gsoft-inc/wl-squide/tree/main/samples/basic/local-module).
- Refer to the [troubleshooting](../troubleshooting.md) page.
