---
order: 80
---

# useRuntime

Retrive a shared `Runtime` instance.

!!!info Info
When possible, prefer [useRoutes](useRoutes.md), [useNavigationItems](useNavigationItems.md), [useLogger](useLogger.md), [useServices](useServices.md) and [useService](useService.md) to `useRuntime`.
!!!

## Reference

```ts
useRuntime()
```

### Parameters

None

### Returns

A `Runtime` instance.

## Usage

```ts !#3
import { useRuntime } from "@squide/react-router";

const runtime = useRuntime();

runtime.logger.debug("Hello!");
```
