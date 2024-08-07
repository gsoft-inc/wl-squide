# setMswAsReady

Indicates to the [useIsMswReady](./useIsMswReady.md) hook that [Mock Service Worker](https://mswjs.io/) (MSW) is ready and the application can safely be rendered.

!!!info

TBD TBD

This hook should be used in pair with either the [useIsMswReady](useIsMswReady.md) hook or the [AppRouter](../routing/appRouter.md) component.
!!!

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
