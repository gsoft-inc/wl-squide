---
toc:
    depth: 2-3
---

# useService

Retrieve a custom service from the `Runtime` instance provided by `RuntimeContext`.

## Reference

```ts
const service = useService(name)
```

### Parameters

- `name`: A custom service instance name.

### Returns

A service instance or undefined if the specified service name doesn't match any registered instance.

## Usage

```ts
import { useService } from "@squide/react-router";
import type { UserService } from "@sample/shared";
 
const userService = useService("use-service") as UserService;

const users = userService.fetchAll();
```
