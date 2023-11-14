# setMswAsStarted

Indicates to the [useIsMswStarted](./useIsMswReady.md) hook that [Mock Service Worker](https://mswjs.io/) (MSW) is started and the application can safely be rendered.

!!!info
This hook should be used in pair with either the [useIsMswReady](useIsMswReady.md) hook or the [AppRouter](../routing/appRouter.md) component.
!!!

## Reference

```ts
setMswAsStarted()
```

### Parameters

None

### Returns

Nothing

## Usage

```ts
import { setMswAsStarted } from "@squide/firefly";

setMswAsStarted();
```
