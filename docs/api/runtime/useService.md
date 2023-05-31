# useService

Retrieve a custom service from the `Runtime` instance provided by `RuntimeContext`.

## Reference

```ts
useService(name)
```

### Parameters

- `name`: A custom service instance name.

### Returns

A service instance or undefined if the specified service name doesn't match any registered instance.

## Usage

```ts !#4
import { useService } from "@squide/react-router";
import type { UserService } from "@sample/shared";
 
const userService = useService("use-service") as UserService;

const users = userService.fetchAll();
```

```tsx !#6-8 bootstrap.tsx
import { createRoot } from "react-dom/client";
import { Runtime, RuntimeContext } from "@squide/react-router";
import { UserService } from "@sample/shared";

const runtime = new Runtime({
    services: {
        "user-service": new UserService()
    }
});

const root = createRoot(document.getElementById("root"));

root.render(
    <RuntimeContext.Provider value={runtime}>
        <App />
    </RuntimeContext.Provider>
);
```
