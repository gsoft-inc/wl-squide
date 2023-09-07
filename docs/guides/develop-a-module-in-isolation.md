---
order: 50
---

# Develop a module in isolation

To develop their own independent module, a team **shouldn't be required to install the host application** or any **other modules** of the application **they do not own**. However, they should still have a means to integrate their module with the application shell (`RootLayout`, `RootErrorBoundary`, etc..) while working on their module in isolation.

To achieve this, the first step is to extract the application shell from the host application. There are several approaches to accomplish this, but in this guide, we'll transform the host application into a monorepo and introduce a new local package named `@sample/shell` for this purpose:

``` !#4,8
host
├── packages
├────── app
├────── shell
├───────── src
├─────────── RootLayout.tsx
├─────────── RootErrorBoundary.tsx
├─────────── useAppRouter.ts
```

## Shell package

> We won't show the implementation details of the `RootLayout` and `RootErrorBoundary` in this guide as it already has been covered many times by other guides.

First, let's add an `appRouter` hook to the shell package. Its purpose is to provide a **reusable router configuration** that can be utilized by both the host application and the isolated modules. By using this hook, modules developed in isolation can utilize the **same application shell and routing configuration** as the host application. 

```ts shell/src/appRouter.ts
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

## Host application

Then, let's revisit the host application and incorporate the newly introduced `useAppRouter` hook:

```tsx !#10-17 host/src/App.tsx
import { RouterProvider } from "react-router-dom";
import { useAreRemotesReady } from "@squide/webpack-module-federation";
import { useAppRouter } from "@sample/shell";

const Login = lazy(() => import("./Login.tsx"));

export function App() {
    const isReady = useAreRemotesReady();

    const router = useAppRouter({
        rootRoutes: [
            {
                path: "/login",
                element: <Login />
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

To begin, let's add an `index.tsx` and `App.tsx` files to the remote module project:

``` !#5,6
remote-module
├── src
├────── register.tsx
├────── Home.tsx
├────── index.tsx
├────── App.tsx
├── package.json
├── webpack.dev.js
```

The `index.tsx` file is similar to the `bootstrap.tsx` file of a host application but, tailored for an isolated module. The key distinction is that, since we set up the project for local development, we'll register the module with the [registerLocalModules](/reference/registration/registerLocalModules.md) function instead of the [registerRemoteModules](/reference/registration/registerRemoteModules.md) function:

```tsx !#10-12,16 remote-module/src/index.tsx
import { createRoot } from "react-dom/client";
import { ConsoleLogger, RuntimeContext, Runtime } from "@squide/react-router";
import { registerLocalModules } from "@squide/webpack-module-federation";
import { App } from "./App.tsx";
import { register } from "./register.tsx";

// Create the shell runtime.
// Services, loggers and sessionAccessor could be reuse through a shared packages
// or faked when in isolation.
const runtime = new Runtime({
    loggers: [new ConsoleLogger()]
});

// Registering the remote module as a static module because the "register" function 
// is local when developing in isolation.
registerStaticModules([register], runtime);

const root = createRoot(document.getElementById("root"));

root.render(
    <RuntimeContext.Provider value={runtime}>
        <App />
    </RuntimeContext.Provider>
);
```

The `App.tsx` file uses the newly created `useAppRouter` hook to setup [React Router](https://reactrouter.com/):

```tsx !#5 App.tsx
import { RouterProvider } from "react-router-dom";
import { useAppRouter } from "@sample/shell";

export function App() {
    const router = useAppRouter();

    return (
        <RouterProvider
            router={router}
            fallbackElement={<div>Loading...</div>}
        />
    );
}
```

Next, add a new `dev-local` script to the `package.json` file to start the local development server in "isolation":

```json !#3 remote-module/package.json
{
    "dev": "webpack serve --config webpack.dev.js",
    "dev-local": "cross-env LOCAL=true webpack serve --config webpack.dev.js",
}
```

The `dev-local` script is similar to the `dev` script but introduces a `LOCAL` environment variable. This new environment variable will be utilized by the `webpack.dev.js` file to conditionally setup the development server for local development in isolation or to be consumed by a host application through the `/remoteEntry.js` entry point:

```js !#9,12 remote-module/webpack.dev.js
// @ts-check

import { defineDevRemoteModuleConfig } from "@squide/webpack-module-federation/defineConfig.js";
import { defineDevConfig } from "@workleap/webpack-configs";
import { swcConfig } from "./swc.dev.js";

let config;

if (!env.LOCAL) {
    config = defineDevRemoteModuleConfig(swcConfig, "remote1", 8080);
} else {
    config = defineDevConfig(swcConfig);
}

export default config;
```

Start the local application by running the `dev-local` script. The federated application shell should wrap the content of the index route of the module.

## Local module

Similarly to remote modules, you can achieve the same isolated setup for local modules. The main difference is that the `webpack.config.js` file of a local module serves the sole purpose of starting a development server for isolated development. Typically, local modules do not rely on [Module Federation](https://webpack.js.org/concepts/module-federation/).

```json local-module/package.json
{
    "dev-local": "webpack serve --config webpack.config.js"
}
```

```js local-module/webpack.config.js
// @ts-check

import { defineDevConfig } from "@workleap/webpack-configs";
import { swcConfig } from "./swc.config.js";

export default defineDevConfig(swcConfig);
```

