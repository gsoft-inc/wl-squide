# useIsMswReady

Force the application to re-render once [Mock Service Worker](https://mswjs.io/) (MSW) is started. Without this hook, the page is rendered before all the request handlers are registered to MSW which could results in 404 errors.

!!!info
If your application is using the [AppRouter](../routing/appRouter.md) component, there's no need for this hook.
!!!

## Reference

```ts
const isMswReady = useIsMswReady(enabled, { interval })
```

### Parameters

- `enabled`: Whether or not MSW is currently enabled for the application. This is especially useful to ensure the application is not waiting for MSW when in production.
- `options`: An optional object literal of options:
    - `interval`: The interval in milliseconds at which the hook is validating if MSW is started.

### Returns

A boolean indicating if MSW is started.

## Usage

```ts
import { useIsMswStarted } from "@squide/firefly";

const isMswStarted = useIsMswStarted(process.env.USE_MSW);
```

[!ref Also take a look at the `setIsMswAsStarted` function](./setMswAsStarted.md)
