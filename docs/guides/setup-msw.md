---
order: 220
label: Setup Mock Service Worker
---

# Setup Mock Service Worker

To speed up frontend development and encourage an [API first](https://swagger.io/resources/articles/adopting-an-api-first-approach/) approach, Squide has built-in support for [Mock Service Worker](https://mswjs.io/) (MSW).

MSW is a tool to fake API endpoints that has the advantage of working directly in the browser. This means that unlike alternative solutions, it doesn't require running an additional process to host the fake API endpoints.

## Setup the host application

Let's start by configuring the host application. First, open a terminal at the root of the host application and install the [msw](https://www.npmjs.com/package/msw) package:

+++ pnpm
```bash
pnpm add msw
```
+++ yarn
```bash
yarn add msw
```
+++ npm
```bash
npm install msw
```
+++

!!!warning
While you can use any package manager to develop an application with Squide, it is highly recommended that you use [PNPM](https://pnpm.io/) as the guides has been developed and tested with PNPM.
!!!

### Add an environment variable

Then, update the `dev` PNPM script to define with [cross-env](https://www.npmjs.com/package/cross-env) an `USE_MSW` environment variable that will [conditionally include MSW code](https://mswjs.io/docs/integrations/browser#conditionally-enable-mocking) into the application bundles:

```json package.json
{
    "scripts": {
        "dev": "cross-env USE_MSW=true webpack serve --config webpack.dev.js"
    }
}
```

Then, update the development [webpack](https://webpack.js.org/) configuration file to include the `USE_MSW` environment variable into the application bundles:

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
Don't forget to define the `USE_MSW` environment variable for the build script and webpack configuration as well.
!!!

### Start the service

With the newly added `USE_MSW` environment variable, the host application bootstrapping code can now be updated to conditionally start MSW when all the request handlers has been registered.

First, define a function to start MSW:

```ts host/mocks/browser.ts
import type { RequestHandler } from "msw";
import { setupWorker } from "msw/browser";

export function startMsw(moduleRequestHandlers: RequestHandler[]) {
    const worker = setupWorker(...moduleRequestHandlers);

    worker.start();
}
```

Then, update the bootstrapping code to [start the service](https://mswjs.io/docs/integrations/browser#setup) and [mark MSW as started](../reference/msw/setMswAsStarted.md) if MSW is enabled:

```tsx !#18-29 host/src/bootstrap.tsx
import { createRoot } from "react-dom/client";
import { ConsoleLogger, RuntimeContext, FireflyRuntime, registerRemoteModules, type RemoteDefinition } from "@squide/firefly";
import { App } from "./App.tsx";
import { registerHost } from "./register.tsx";

const Remotes: RemoteDefinition[] = [
    { url: "http://localhost:8081", name: "remote1" }
];

const runtime = new FireflyRuntime({
    loggers: [new ConsoleLogger()]
});

await registerLocalModules([registerHost], runtime);

await registerRemoteModules(Remotes, runtime);

// Once both register functions are done, we can safely assume that all the request handlers has been registered.
if (process.env.USE_MSW) {
    // Files that includes an import to the "msw" package are included dynamically to prevent adding
    // unused MSW stuff to the application bundles.
    const startMsw = (await import("../mocks/browser.ts")).startMsw;

    // Will start MSW with the modules request handlers.
    startMsw(runtime.requestHandlers);

    // Indicate that MSW has been started and the routes can now be safely rendered.
    setMswAsStarted();
}

const root = createRoot(document.getElementById("root")!);

root.render(
    <RuntimeContext.Provider value={runtime}>
        <App />
    </RuntimeContext.Provider>
);
```

### Delay routes rendering until the service is started

Finally, update the host application code to delay the rendering of the routes until MSW is started. This is done by setting the `waitForMsw` property of the [AppRouter](../reference/routing/appRouter.md) component to `true`:

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

## Setup a remote module

First, open a terminal at the root of the remote module application and install the [msw](https://www.npmjs.com/package/msw) package:

+++ pnpm
```bash
pnpm add msw
```
+++ yarn
```bash
yarn add msw
```
+++ npm
```bash
npm install msw
```
+++

Then, define a [request handler](https://mswjs.io/docs/concepts/request-handler/):

```ts remote-module/mocks/handlers.ts
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

Finally, register the request handler with the [FireflyRuntime](../reference/runtime/runtime-class.md) instance:

```ts !#4,7,9 remote-module/src/register.tsx
import { type ModuleRegisterFunction, type FireflyRuntime } from "@squide/firefly"; 

export const register: ModuleRegisterFunction<FireflyRuntime> = async runtime => {
    if (process.env.USE_MSW) {
        // Files that includes an import to the "msw" package are included dynamically to prevent adding
        // unused MSW stuff to the application bundles.
        const requestHandlers = (await import("../mocks/handlers.ts")).requestHandlers;

        runtime.registerRequestHandlers(requestHandlers);
    }
}
```

!!!info
Don't forget to mark the registration function as `async` since there's a dynamic import.
!!!

## Setup a local module

Follow the same steps as for a [remote module](#setup-a-remote-module).

## Try it :rocket:

Update a page component code to fetch the `/api/character/1` fake API endpoint, then start the application in development mode using the `dev` script. You should notice that the data has been fetched from the request handler.

> In Chrome [devtools](https://developer.chrome.com/docs/devtools/), the status code for a successful network call that has been handled by an MSW request handler will be `200 OK (from service worker)`.

### Troubleshoot issues

If you are experiencing issues with this guide:

- Open the [DevTools](https://developer.chrome.com/docs/devtools/) console. You'll find a log entry for each registration that occurs and error messages if something went wrong.
- Refer to a working example on [GitHub](https://github.com/gsoft-inc/wl-squide/tree/main/samples/endpoints).
- Refer to the [troubleshooting](../troubleshooting.md) page.
