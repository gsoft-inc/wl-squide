---
order: 90
---

# RuntimeContext

[React context](https://react.dev/reference/react/createContext) to share a `Runtime` instance between an host application and the modules.

## Reference

```tsx
<RuntimeContext.Provider value={runtime}>
    <App />
</RuntimeContext.Provider>
```

### Parameters

- `value`: A `Runtime` instance.

## Usage

### Provide a Runtime instance

```tsx !#9-11
import { createRoot } from "react-dom/client";
import { Runtime, RuntimeContext } from "@squide/react-router";

const runtime = new Runtime();

const root = createRoot(document.getElementById("root"));

root.render(
    <RuntimeContext.Provider value={runtime}>
        <App />
    </RuntimeContext.Provider>
);
```

### Retrieve a Runtime instance

```ts !#3
import { useRuntime } from "@squide/react-router";

const runtime = useRuntime();

runtime.logger.debug("Hello!");
```



