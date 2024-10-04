---
toc:
    depth: 2-3
---

# useLoggers

Retrieve a `RuntimeLogger` instance from the `FireflyRuntime` instance. The returned instance will log messages to the _specified_ [Logger](../logging/Logger.md) instances.

## Reference

```ts
const logger = useLoggers(names)
```

### Parameters

- `names`: The name of the logger instances to log messages to.

### Returns

A `RuntimeLogger` instance.

## Usage

```ts
import { useLoggers, ConsoleLogger } from "@squide/firefly";

const logger = useLoggers([ConsoleLogger.name]);

logger.debug("Hello", { world: "!" });
```
