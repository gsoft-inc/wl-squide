---
toc:
    depth: 2-3
---

# getMswPlugin

Return an instance of the [MswPlugin](./MswPlugin.md) from the list of plugins registered in the [Runtime](../runtime/runtime-class.md) instance.

## Reference

```ts
const plugin = getMswPlugin(runtime)
```

### Parameters

- `runtime`: A runtime instance.

### Returns

An `MswPlugin` instance if the plugin has been registered, otherwise an `Error` is thrown.

## Usage

```ts
import { getMswPlugin } from "@squide/firefly";

const plugin = getMswPlugin(runtime);
```
