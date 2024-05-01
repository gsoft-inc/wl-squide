---
order: 780
---

# Override a React context

In a federated application using [Module Federation](https://module-federation.io/), it's typical to configure various global [React context](https://legacy.reactjs.org/docs/context.html) at the root of the host application. These contexts are usually consumed down the line by the layouts and pages of the remote modules.

Let's explore a simple example using a `BackgroundColorContext`:

```tsx !#7 host/src/App.tsx
import { AppRouter } from "@squide/firefly";
import { BackgroundColorContext } from "@sample/shared";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

export function App() {
    return (
        <BackgroundColorContext.Provider value="blue">
            <AppRouter
                fallbackElement={<div>Loading...</div>}
                errorElement={<div>An error occured!</div>}
                waitForMsw={false}
            >
                {(routes, providerProps) => (
                    <RouterProvider router={createBrowserRouter(routes)} {...providerProps} />
                )}
            </AppRouter>
        </BackgroundColorContext.Provider>
    );
}
```

```tsx !#7 remote-module/src/register.tsx
import type { ModuleRegisterFunction, FireflyRuntime } from "@squide/firefly";
import { ColoredPage } from "./ColoredPage.tsx";

export const register: ModuleRegisterFunction<FireflyRuntime> = runtime => {
    runtime.registerRoute({
        path: "/colored-page",
        element: <ColoredPage />
    });
}
```

```tsx !#4 remote-module/src/ColoredPage.tsx
import { useBackgroundColor } from "@sample/shared";

export function ColoredPage() {
    const backgroundColor = useBackgroundColor();

    return (
        <div style={{ backgroundColor }}>
            The background color is "{backgroundColor}"
        </div>
    );
}
```

In the previous code samples, the host application provides a value for the `BackgroundColorContext`, and the `ColoredPage` component of the remote module utilizes this value to set its background color (in this example, the background color is set to `blue`).

## Override the context for the remote module

Now, suppose the requirements change, and one remote module pages need to have a `red` background. The context can be overriden for the remote module by declaring a new provider directly in the routes registration:

```tsx !#9 remote-module/src/register.tsx
import type { ModuleRegisterFunction, FireflyRuntime } from "@squide/firefly";
import { BackgroundColorContext } from "@sample/shared";
import { ColoredPage } from "./ColoredPage.tsx";

export const register: ModuleRegisterFunction<FireflyRuntime> = runtime => {
    runtime.registerRoute({
        path: "/colored-page",
        element: (
            <BackgroundColorContext.Provider value="red">
                <ColoredPage />
            </BackgroundColorContext.Provider>
        )
    });
}
```

### Extract an utility component

Since there are multiple routes to setup with the new provider, an utility component can be extracted:

```tsx !#6-12,17 remote-module/src/register.tsx
import type { ModuleRegisterFunction, FireflyRuntime } from "@squide/firefly";
import { BackgroundColorContext } from "@sample/shared";
import { ColoredPage } from "./ColoredPage.tsx";
import type { ReactNode } from "react";

function RedBackground({ children }: { children: ReactNode }) {
    return (
        <BackgroundColorContext.Provider value="red">
            {children}
        </BackgroundColorContext.Provider>
    );
}

export const register: ModuleRegisterFunction<FireflyRuntime> = runtime => {
    runtime.registerRoute({
        path: "/colored-page",
        element: <RedBackground><ColoredPage /></RedBackground>
    });
}
```

## Update a singleton dependency version

Let's consider a more specific use case where the host application declares a `ThemeContext` from Workleap's new design system, [Hopper](https://hopper.workleap.design/):

```tsx !#7 host/src/App.tsx
import { AppRouter } from "@squide/firefly";
import { ThemeContext } from "@hopper/components";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

export function App() {
    return (
        <ThemeContext.Provider value="dark">
            <AppRouter
                fallbackElement={<div>Loading...</div>}
                errorElement={<div>An error occured!</div>}
                waitForMsw={false}
            >
                {(routes, providerProps) => (
                    <RouterProvider router={createBrowserRouter(routes)} {...providerProps} />
                )}
            </AppRouter>
        </ThemeContext.Provider>
    );
}
```

In this scenario, Hopper's components are used throughout the entire federated application, including the remote modules. Moreover, `@hopper/components` is defined as a [singleton](https://module-federation.io/configure/shared.html#singleton) shared dependency:

```js !#8-10 host/webpack.dev.js
// @ts-check

import { defineDevHostConfig } from "@squide/firefly-webpack-configs";
import { swcConfig } from "./swc.dev.js";

export default defineDevHostConfig(swcConfig, "host", 8080, [], {
    sharedDependencies: {
        "@hopper/components": {
            singleton: true
        }
    }
});
```

Now, consider a situation where Hopper releases a new version of the package that includes breaking changes, without a "compatibility" package to ensure backward compatility with the previous version.

To update the host application without breaking the remote modules, the recommended approach is to temporary "break" the singleton shared dependency by loading two versions of the dependency in parallel (one for the host application and one for the remote modules that have not been updated yet).

As `@hopper/components` expose the `ThemeContext`, the context must be re-declared in each remote module until every part of the federated application has been updated to the latest version of Hopper:

```tsx !#6-12,17 remote-module/src/register.tsx
import type { ModuleRegisterFunction, FireflyRuntime } from "@squide/firefly";
import { ThemeContext } from "@hopper/components";
import { Page } from "./Page.tsx";
import type { ReactNode } from "react";

function Providers({ children }: { children: ReactNode }) {
    return (
        <ThemeContext.Provider value="dark">
            {children}
        </ThemeContext.Provider>
    )
}

export const register: ModuleRegisterFunction<FireflyRuntime> = runtime => {
    runtime.registerRoute({
        path: "/page",
        element: <Providers><Page /></Providers>
    });
}
```

Thankfully, [React Router](https://reactrouter.com/en/main) makes it very easy to declare contexts in a remote module.
