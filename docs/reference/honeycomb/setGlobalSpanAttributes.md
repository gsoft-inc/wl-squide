---
toc:
    depth: 2-3
---

# setGlobalSpanAttributes

Set global attributes to be included in all Honeycomb Web traces.

## Reference

```ts
setGlobalSpanAttributes(attributes: {})
```

### Parameters

- `attributes`: The attributes to include in every trace.

### Returns

Nothing

## Usage

```ts
import { setGlobalSpanAttributes } from "@squide/firefly-honeycomb";

setGlobalSpanAttributes({
    "app.user_id": "123"
});
```
