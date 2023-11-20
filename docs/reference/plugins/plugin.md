---
toc:
    depth: 2-3
---

# Plugin

An abstract base class to define a plugin.

## Usage

### Define a plugin

```ts !#3 my-plugin/src/myPlugin.ts
import { Plugin, type FireflyRuntime } from "@squide/firefly";

export class MyPlugin extends Plugin {
    #runtime: FireflyRuntime;

    constructor() {
        super(MyPlugin.name);
    }

    // An optional method that can be implemented to get a hold on the current runtime instance.
    _setRuntime(runtime: FireflyRuntime) {
        this.#runtime = runtime;
    }
}
```

### Register a plugin

```ts !#5
import { FireflyRuntime } from "@squide/firefly";
import { MyPlugin } from "@sample/my-plugin";

const runtime = new FireflyRuntime({
    plugins: [new MyPlugin()]
});
```

### Retrieve a plugin from a runtime instance

```ts
import { MyPlugin } from "@sample/my-plugin";

const myPlugin = runtime.getPlugin(MyPlugin.name) as MyPlugin;
```

### Retrieve a plugin with a custom function

We recommend pairing a plugin definition with a custom function to retrieve the plugin from a runtime instance.

```ts !#9-11 my-plugin/src/myPlugin.ts
import { Plugin, type FireflyRuntime } from "@squide/firefly";

export class MyPlugin extends FireflyRuntime {
    constructor() {
        super(MyPlugin.name);
    }
}

export function getMyPlugin(runtime: FireflyRuntime) {
    return runtime.getPlugin(MyPlugin.name) as MyPlugin;
}
```

```ts
import { getMyPlugin } from "@sample/my-plugin";

const myPlugin = getMyPlugin(runtime);
```

Retrieving a plugin with a custom function doesn't require the consumer to remember the plugin name, and has the upside of inferring the typings.
