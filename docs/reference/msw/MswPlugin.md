---
order: 100
toc:
    depth: 2-3
---

# MswPlugin

A plugin to faciliate the integration of [Mock Service Worker](https://mswjs.io/) (MSW) in a federated application.

> MSW doesn't support having multiple remote modules starting their own service worker as MSW request handlers must be registered to a **service worker that is on the same host as the originator of an HTTP request** (which would always be the host application for a federated application). To circumvent this limitation, `@squide/msw` offers a shared registry to modules, allowing them to register their request handlers in a way that makes them available to the host application. The host application can then retrieve the request handlers registered by the modules and register them to it's own MSW.

## Reference

```ts
const mswPlugin = new MswPlugin();
```

### Parameters

None

## Usage

!!! warning
Don't forget to [activate the msw feature](../webpack/defineDevHostConfig.md#activate-optional-features) on the host application as well as every remote module.
!!!

Do not include MSW in production code. To address this, we recommend conditionally importing the code that includes the [msw](https://www.npmjs.com/package/msw) package based on an environment variable.

To do so, first use [cross-env](https://www.npmjs.com/package/cross-env) to define a `USE_MSW` environment variable in a PNPM script:

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

Finally, use the `USE_MSW` environment variable to conditionally import any files that includes the [msw](https://www.npmjs.com/package/msw) package:

```ts mocks/handlers.ts
import { rest, type RestHandler } from "msw";

export const requestHandlers: RestHandler[] = [
    rest.get("/api/character/1", async (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json([{
                "id": 1,
                "name": "Rick Sanchez",
                "status": "Alive"
            }]);
        )
    })
];
```

```ts !#1 register.tsx
if (process.env.USE_MSW) {
    const requestHandlers = (await import("./mocks/handlers.ts")).requestHandlers;
    ...
}
```

### Register the MSW plugin

```ts !#7
import { MswPlugin } from "@squide/msw";
import { Runtime } from "@squide/react-router";

const mswPlugin = new MswPlugin();

const runtime = new Runtime({
    plugins: [mswPlugin]
});
```

### Register request handlers

```ts !#3,8,10
import { getMswPlugin } from "@squide/msw";

if (process.env.USE_MSW) {
    const mswPlugin = getMswPlugin(runtime);

    // Files including an import to the "msw" package are included dynamically to prevent adding
    // MSW stuff to the bundled when it's not used.
    const requestHandlers = (await import("./mocks/handlers.ts")).requestHandlers;

    mswPlugin.registerRequestHandlers(requestHandlers);
}
```

### Retrieve the request handlers

```ts
const handlers = mswPlugin.requestHandlers;
```

