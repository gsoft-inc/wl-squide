---
toc:
    depth: 2-3
---

# useLogger

Retrieve a `RuntimeLogger` instance from the `FireflyRuntime` instance.

## Reference

```ts
const logger = useLogger()
```

### Parameters

None

### Returns

A `RuntimeLogger` instance.

## Usage

```ts
import { useLogger } from "@squide/firefly";

const logger = useLogger();

logger.debug("Hello", { world: "!" });
```
