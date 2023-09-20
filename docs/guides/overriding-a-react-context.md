---
order: 30
label: Overriding a React context
---

# Overriding a React context for a specific remote module

In a federated application using [Module Federation](https://webpack.js.org/concepts/module-federation/), it's typical to configure various global [React contexts](https://legacy.reactjs.org/docs/context.html) at the root of the host application that will be consumed by the remote modules.

Let's take a sample example using a `BackgroundColorContext`:

```tsx !#16-21 host/src/App.tsx
import { useAppRouter } from "@sample/shell";
import { BackgroundColorContext } from "@sample/shared";
import { useAreModulesReady } from "@squide/webpack-module-federation";
import { RouterProvider } from "react-router-dom";

export function App() {
    const isReady = useAreModulesReady();

    const router = useAppRouter(sessionManager);

    if (!isReady) {
        return <div>Loading...</div>;
    }

    return (
        <BackgroundColorContext.Provider value="blue">
            <RouterProvider
                router={router}
                fallbackElement={<div>Loading...</div>}
            />
        </BackgroundColorContext.Provider>
    );
}
```

```tsx !#8 remote-module/src/register.tsx
import type { ModuleRegisterFunction, Runtime } from "@squide/react-router";
import { ColoredPage } from "./ColoredPage.tsx";

export const register: ModuleRegisterFunction<Runtime> = runtime => {
    runtime.registerRoutes([
        {
            path: "/colored-page",
            element: <ColoredPage />
        }
    ]);
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

Now, suppose the requirements change, and the remote module's pages need to have a `red` background. The context can be overriden for the remote module by declaring a new provider directly in the routes registration:

```tsx !#10-12 remote-module/src/register.tsx
import type { ModuleRegisterFunction, Runtime } from "@squide/react-router";
import { BackgroundColorContext } from "@sample/shared";
import { ColoredPage } from "./ColoredPage.tsx";

export const register: ModuleRegisterFunction<Runtime> = runtime => {
    runtime.registerRoutes([
        {
            path: "/colored-page",
            element: (
                <BackgroundColorContext.Provider value="red">
                    <ColoredPage />
                </BackgroundColorContext.Provider>
            )
        }
    ]);
}
```

## Extract an utility function

If there was multiple routes to setup with the new provider, an utility function could be extracted:

```tsx
import type { ModuleRegisterFunction, Runtime } from "@squide/react-router";
import { BackgroundColorContext } from "@sample/shared";
import { ColoredPage } from "./ColoredPage.tsx";
import type { ReactElement } from "react";

function withRedBackground(page: ReactElement) {
    return (
        <BackgroundColorContext.Provider value="red">
            {page}
        </BackgroundColorContext.Provider>
    )
}

export const register: ModuleRegisterFunction<Runtime> = runtime => {
    runtime.registerRoutes([
        {
            path: "/colored-page",
            element: withRedBackground(<ColoredPage />)
        }
    ]);
}
```




