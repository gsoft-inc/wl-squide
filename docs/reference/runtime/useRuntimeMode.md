---
order: 70
toc:
    depth: 2-3
---

# useRuntimeMode

Retrieve the runtime mode.

## Reference

```ts
const mode = useRuntimeMode()
```

### Parameters

None

### Returns

Either `"development"` or `"production"`.

## Usage

```ts
import { useRuntimeMode } from "@squide/firefly";

const mode = useRuntimeMode();
```
