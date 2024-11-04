# setMswAsReady

!!!warning
This function is **deprecated**, use the [bootstrap](../registration/bootstrap.md) function instead.
!!!

Indicates to the [AppRouter](../routing/appRouter.md) that [Mock Service Worker](https://mswjs.io/) is ready and the application can safely be rendered.

## Reference

```ts
setMswAsReady()
```

### Parameters

None

### Returns

Nothing

## Usage

```ts
import { setMswAsReady } from "@squide/firefly";

setMswAsReady();
```
