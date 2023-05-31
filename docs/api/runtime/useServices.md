# useServices

Retrieve a string-keyed object literal of custom service instances from the `Runtime` instance provided by `RuntimeContext`.

## Reference

```ts
useServices()
```

### Parameters

None

### Returns

A string-keyed object literal of custom service instances.

## Usage

```ts !#3
import { useServices } from "@squide/react-router";
 
const services = useServices();
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
