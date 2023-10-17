---
order: 100
toc:
    depth: 2-3
---

# MswPlugin

A plugin to faciliate the integration of [Mock Service Worker](https://mswjs.io/) (MSW) in a federated application.

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

### Mark MSW as started

```ts !#7
mswPlugin.setAsStarted();
```

### Retrieve MSW status

```ts !#7
import { getMswPlugin } from "@squide/msw";
import { useRuntime } from "@squide/react-router";

const runtime = useRuntime();
const mswPlugin = getMswPlugin(runtime);

const isMswStarted = mswPlugin.isStarted;
```

