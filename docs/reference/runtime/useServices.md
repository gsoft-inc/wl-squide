---
toc:
    depth: 2-3
---

# useServices

Retrieve an array of custom service instances from the `Runtime` instance provided by `RuntimeContext`.

## Reference

```ts
const services = useServices()
```

### Parameters

None

### Returns

An array of custom service instances.

## Usage

```ts
import { useServices } from "@squide/react-router";
 
const services = useServices();
```
