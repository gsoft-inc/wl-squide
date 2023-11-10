# setMswAsStarted

Indicates to the [useIsMswStarted](./useIsMswReady.md) hook that [Mock Service Worker](https://mswjs.io/) (MSW) is started and the application can safely be rendered.

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

[!ref Also take a look at the `useIsMswReady` hook](./useIsMswReady.md)
