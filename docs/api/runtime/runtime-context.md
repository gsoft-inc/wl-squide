---
order: 90
---

# RuntimeContext

React context to share a `Runtime` instance between an host application and the application modules.

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
import { Runtime, RuntimeContext } from "@squide/react-router";
import { createRoot } from "react-dom/client";

const runtime = new Runtime();

const root = createRoot(document.getElementById("root"));

root.render(
    <RuntimeContext.Provider value={runtime}>
        <App />
    </RuntimeContext.Provider>
);
```

### Retrieve a Runtime instance

```ts
import { useRuntime } from "@squide/react-router";

const runtime = useRuntime();
```



