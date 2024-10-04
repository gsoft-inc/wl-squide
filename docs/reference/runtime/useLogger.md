---
toc:
    depth: 2-3
---

# useLogger

Retrieve a `RuntimeLogger` instance from the `FireflyRuntime` instance. The returned logger will log messages to all registered [Logger](../logging/Logger.md) instances.

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
