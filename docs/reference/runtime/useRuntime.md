---
order: 80
toc:
    depth: 2-3
---

# useRuntime

Retrieve a `FireflyRuntime` instance.

!!!info
When possible, prefer [useRoutes](useRoutes.md), [useNavigationItems](useNavigationItems.md), [useLogger](useLogger.md) to `useRuntime`.
!!!

## Reference

```ts
const runtime = useRuntime()
```

### Parameters

None

### Returns

A `FireflyRuntime` instance.

## Usage

```ts
import { useRuntime } from "@squide/firefly";

const runtime = useRuntime();

runtime.logger.debug("Hello!");
```
