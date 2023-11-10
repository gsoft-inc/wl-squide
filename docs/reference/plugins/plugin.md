---
toc:
    depth: 2-3
---

# Plugin

An abstract base class to define a plugin.

## Usage

### Define a plugin

```ts !#4 shared/src/mswPlugin.ts
import { Plugin } from "@squide/firefly";
import type { RestHandler } from "msw";

export class MswPlugin extends Plugin {
    constructor() {
        super(MswPlugin.name);
    }

    registerRequestHandlers(handlers: RestHandler[]) {
        ...
    }
}
```

### Register a plugin

```ts !#5
import { Runtime } from "@squide/firefly";
import { MswPlugin } from "@squide/msw";

const runtime = new Runtime({
    plugins: [new MswPlugin()]
});
```

### Retrieve a plugin from a runtime instance

```ts !#4
import { MswPlugin } from "@sample/shared";
import { requetHandlers } from "../mocks/handlers.ts";

const mswPlugin = runtime.getPlugin(MswPlugin.name) as MswPlugin;

mswPlugin.registerRequestHandlers(requetHandlers);
```

### Retrieve a plugin with a custom function

We recommend pairing a plugin definition with a custom function to retrieve the plugin from a runtime instance.

```ts !#14-16 shared/src/mswPlugin.ts
import { Plugin, type Runtime } from "@squide/firefly";
import type { RestHandler } from "msw";

export class MswPlugin extends Plugin {
    constructor() {
        super(MswPlugin.name);
    }

    registerRequestHandlers(handlers: RestHandler[]) {
        ...
    }
}

export function getMswPlugin(runtime: Runtime) {
    return runtime.getPlugin(MswPlugin.name);
}
```

```ts
import { getMswPlugin } from "@sample/shared";

const mswPlugin = getMswPlugin(runtime);
```

Retrieving a plugin with a custom function doesn't require the consumer to remember the plugin name, and has the upside of inferring the typings.
