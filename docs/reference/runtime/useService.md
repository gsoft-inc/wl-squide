---
toc:
    depth: 2-3
---

# useService

Retrieve a custom service instance from the `Runtime` instance provided by `RuntimeContext`.

## Reference

```ts
const service = useService(name)
```

### Parameters

- `name`: A custom service name.

### Returns

A service instance or throw an error if the specified service name doesn't match any registered instance.

## Usage

```ts
import { useService } from "@squide/react-router";
import { TelemetryService } from "@sample/shared";
 
const telemetryService = useService(TelemetryService.name) as TelemetryService;
```
