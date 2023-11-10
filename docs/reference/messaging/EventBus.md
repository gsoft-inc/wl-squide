---
toc:
    depth: 2-3
---

# EventBus

A basic implementation of a [pub/sub](https://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern) mecanism enabling loosely coupled between the host application and the modules.

## Reference

```ts
const eventBus = new EventBus(options?: { logger? })
```

### Parameters

- `options`: An optional object literal of options:
    - `logger`: An optional logger to facilitate debugging.

## Usage

### Create an `EventBus` instance

```ts
import { EventBus, ConsoleLogger } from "@squide/firefly";

const eventBus = new EventBus({
    logger: new ConsoleLogger()
});
```

### Add a listener

!!!info
When possible, prefer [useEventBusListener](useEventBusListener.md) to `eventBus.addListener`.
!!!

```ts
import { useCallback } from "react";

const handleFoo = useCallback((data, context) => {
    // do something...
}, [];

// Listen to every "foo" events.
eventBus.addListener("foo", handleFoo);

// Listen to the first "foo" event, then automatically remove the listener.
eventBus.addListener("foo-once", handleFoo, { once: true });
```

### Remove a listener

```ts
// Remove a regular listener.
eventBus.removeListener("foo", handleFoo);

// Remove a listener created with the `once` option.
eventBus.removeListener("foo-once", handleFoo, { once: true });
```

### Dispatch an event

!!!info
When possible, prefer [useEventBusDispatcher](useEventBusListener.md) to `eventBus.dispatch`.
!!!

```ts
eventBus.dispatch("foo", "bar");
```

