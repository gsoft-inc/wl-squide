---
order: 70
toc:
    depth: 2-3
---

# useRoutes

Retrieve the registered routes from the `Runtime` instance provided by `RuntimeContext`.

## Reference

```ts
const routes = useRoutes()
```

### Parameters

None

### Returns

An array of `Route`.

## Usage

```ts
import { useRoutes } from "@squide/firefly";

const routes = useRoutes();
```
