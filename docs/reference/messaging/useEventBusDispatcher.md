---
toc:
    depth: 2-3
---

# useEventBusDispatcher

Retrieve an `EventBus` instance from the `Runtime` instance provided by `RuntimeContext` and provide a function to dispatch an event.

## Reference

```ts
const dispatch = useEventBusDispatcher()
```

### Parameters

None

### Returns

A dispatch function.

## Usage

```ts
import { useEventBusDispatcher } from "@squide/firefly";

const dispatch = useEventBusDispatcher();

dispatch("foo", "bar");
```
