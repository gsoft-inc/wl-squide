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

!!!info
Do not include MSW in production code. To address this, we recommend conditionally importing the code using the [msw](https://www.npmjs.com/package/msw) package based on an environment variable.
!!!

### Register the plugin

```ts !#7
import { MswPlugin } from "@squide/msw";
import { Runtime } from "@squide/react-router";

const mswPlugin = new MswPlugin();

const runtime = new Runtime({
    plugins: [mswPlugin]
});
```

### Register request handlers

```ts !#10
import { getMswPlugin } from "@squide/msw";

if (process.env.USE_MSW) {
    const mswPlugin = getMswPlugin(runtime);

    // Files including an import to the "msw" package are included dynamically to prevent adding
    // MSW stuff to the bundled when it's not used.
    const requestHandlers = (await import("../mocks/handlers.ts")).requestHandlers;

    mswPlugin.registerRequestHandlers(requestHandlers);
}
```

### Retrieve the request handlers

```ts
const handlers = mswPlugin.requestHandlers;
```

