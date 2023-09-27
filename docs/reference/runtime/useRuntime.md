---
order: 80
toc:
    depth: 2-3
---

# useRuntime

Retrive a shared `Runtime` instance.

!!!info
When possible, prefer [useRoutes](useRoutes.md), [useNavigationItems](useNavigationItems.md), [useLogger](useLogger.md), [useServices](useServices.md), [useService](useService.md) to `useRuntime`.
!!!

## Reference

```ts
const runtime = useRuntime()
```

### Parameters

None

### Returns

A `Runtime` instance.

## Usage

```ts
import { useRuntime } from "@squide/react-router";

const runtime = useRuntime();

runtime.logger.debug("Hello!");
```
