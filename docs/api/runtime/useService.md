# useService

Retrieve a custom service from the `Runtime` instance provided by `RuntimeContext`.

## Reference

```ts
useService(name)
```

### Parameters

- `name`: A service name.

### Returns

A service instance or undefined if the service isn't registered.

## Usage

```ts !#4
import { useService } from "@squide/react-router";
import type { UserService } from "@sample/shared";
 
const userService = useService("use-service") as UserService;

const users = userService.fetchAll();
```
