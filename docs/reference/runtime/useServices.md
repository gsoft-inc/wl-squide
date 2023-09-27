---
toc:
    depth: 2-3
---

# useServices

Retrieve a string-keyed object literal of custom service instances from the `Runtime` instance provided by `RuntimeContext`.

## Reference

```ts
const services = useServices()
```

### Parameters

None

### Returns

A string-keyed object literal of custom service instances.

## Usage

```ts
import { useServices } from "@squide/react-router";
 
const services = useServices();
```
