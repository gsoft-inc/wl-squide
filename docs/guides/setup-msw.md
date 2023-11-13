---
order: 30
label: Setup Mock Service Worker
---

<!-- 

TBD

Must REDO this doc:

- First step must be to install"msw" (dont need to install @squide/msw it's already a dependency of @squide/firefly)
- Should to 2 distinct section:
    - Setup the host application
    - Setup a module
        For this example, we will use a remote module but the same goes for a local module....
    
-->


# Setup Mock Service Worker

[Mock Service Worker](https://mswjs.io/) (MSW) is a great tool to fake API endpoints. It has the advantage of working directly in the browser, which means that unlike alternative solutions, it doesn't require running an additional process to host the fake API endpoints.

## Add an environment variable

First, let's update the PNPM script to define with [cross-env](https://www.npmjs.com/package/cross-env) a `USE_MSW` environment variable that will conditionally enable MSW:

```json package.json
{
    "scripts": {
        "dev": "cross-env USE_MSW=true webpack serve --config webpack.dev.js"
    }
}
```

Then, forward the `USE_MSW` environment variable to the application code bundles:

```js !#7 webpack.dev.js
// @ts-check

import { defineDevHostConfig } from "@squide/webpack-module-federation";

export default defineDevHostConfig(swcConfig, "host", 8080, {
    environmentVariables: {
        "USE_MSW": process.env.USE_MSW === "true"
    }
});
```

> For more information about the `environmentVariables` predefined option, refer to the [webpack configuration documentation](https://gsoft-inc.github.io/wl-web-configs/webpack/configure-dev/#define-environment-variables).

!!!warning
Don't forget to define the `USE_MSW` environment variable for the build script as well (the one using `defineBuildHostConfig`).
!!!

The `USE_MSW` environment variable will prevent including MSW related code into the application code bundles when MSW is disabled.

## Register the plugin and start MSW

Then, update the host application bootstrapping code to [registrer the MSW plugin](../reference/msw/mswPlugin.md#register-the-msw-plugin) and start MSW once all the request handlers has been registered:

```tsx !#14,21-31 host/src/bootstrap.tsx
import { createRoot } from "react-dom/client";
import { ConsoleLogger, RuntimeContext, FireflyRuntime, registerRemoteModules, type RemoteDefinition } from "@squide/firefly";
import { MswPlugin } from "@squide/msw";
import { App } from "./App.tsx";
import { registerHost } from "./register.tsx";

const Remotes: RemoteDefinition[] = [
    { url: "http://localhost:8081", name: "remote1" }
];

const runtime = new FireflyRuntime({
    loggers: [new ConsoleLogger()],
    // Register MSW plugin to the application runtime.
    plugins: [new MswPlugin()]
});

await registerLocalModules([registerHost], runtime);

await registerRemoteModules(Remotes, runtime);

if (process.env.USE_MSW) {
    // Files that includes an import to the "msw" package are included dynamically to prevent adding
    // unused MSW stuff to the code bundles.
    const startMsw = (await import("../mocks/browser.ts")).startMsw;

    // Will start MSW with the request handlers provided by every module.
    startMsw(mswPlugin.requestHandlers);

    // Indicate to resources that are dependent on MSW that the service has been started.
    setMswAsStarted();
}

const root = createRoot(document.getElementById("root")!);

root.render(
    <RuntimeContext.Provider value={runtime}>
        <App />
    </RuntimeContext.Provider>
);
```

## Delay the routes rendering until MSW is started

Then, update the host application code to delay the rendering of the application routes until MSW is started. This is done by activating the `waitForMsw` property of the [AppRouter](../reference/routing/appRouter.md) component:

```tsx !#8 host/src/App.tsx
import { AppRouter } from "@squide/firefly";

export function App() {
    return (
        <AppRouter
            fallbackElement={<div>Loading...</div>}
            errorElement={<div>An error occured!</div>}
            waitForMsw={process.env.USE_MSW}
        />
    );
}
```

## Register request handlers

Next, define an MSW request handler in a remote module (or local module):

```ts
import { HttpResponse, http, type HttpHandler } from "msw";

export const requestHandlers: HttpHandler[] = [
    http.get("/api/character/1", async () => {
        return HttpResponse.json([{
            "id": 1,
            "name": "Rick Sanchez",
            "status": "Alive"
        }]);
    })
];
```

Then, register the request handler with the shared registry:

```ts !#4,9,11 remote-module/src/register.tsx
import { getMswPlugin, type ModuleRegisterFunction, type FireflyRuntime } from "@squide/firefly"; 

export const register: ModuleRegisterFunction<FireflyRuntime> = async runtime => {
    if (process.env.USE_MSW) {
        const mswPlugin = getMswPlugin(runtime);

        // Files that includes an import to the "msw" package are included dynamically to prevent adding
        // unused MSW stuff to the code bundles.
        const requestHandlers = (await import("../mocks/handlers.ts")).requestHandlers;

        mswPlugin.registerRequestHandlers(requestHandlers);
    }
}
```

!!!info
Don't forget to mark the registration function as `async` since there's a dynamic import.
!!!

## Try it :rocket:

Update a page component code to fetch the `/api/character/1` fake API endpoint, then start the application in development mode using the `dev` script. You should notice that the data has been fetched from the MSW request handler.

> In Chrome devtools, the status code for a successful network call to an MSW request handler will be `200 OK (from service worker)`.
