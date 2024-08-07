# useIsMswReady

Force the application to re-render once [Mock Service Worker](https://mswjs.io/) (MSW) is ready. Without this hook, the page is rendered before all the request handlers are registered to MSW which could results in 404 errors.

!!!info

TBD TBD

If your application is using the [AppRouter](../routing/appRouter.md) component, you shouldn't use this hook.
!!!

## Reference

```ts
const isMswReady = useIsMswReady(enabled)
```

### Parameters

- `enabled`: Whether or not MSW is currently enabled for the application. This is especially useful to ensure the application is not waiting for MSW when in production.

### Returns

A boolean indicating if MSW is ready.

## Usage

```ts
import { useIsMswReady } from "@squide/firefly";

const isMswReady = useIsMswReady(process.env.USE_MSW);
```

[!ref Also take a look at the `setIsMswAsReady` function](./setMswAsReady.md)
