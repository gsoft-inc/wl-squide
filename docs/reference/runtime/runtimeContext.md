---
order: 90
toc:
    depth: 2-3
---

# RuntimeContext

[React context](https://react.dev/reference/react/createContext) to share a `FireflyRuntime` instance between an host application and the modules.

## Reference

```tsx
<RuntimeContext.Provider value={runtime}>
    <App />
</RuntimeContext.Provider>
```

### Properties

- `value`: A `FireflyRuntime` instance.

## Usage

### Provide a runtime instance

```tsx !#9-11
import { createRoot } from "react-dom/client";
import { FireflyRuntime, RuntimeContext } from "@squide/firefly";

const runtime = new FireflyRuntime();

const root = createRoot(document.getElementById("root"));

root.render(
    <RuntimeContext.Provider value={runtime}>
        <App />
    </RuntimeContext.Provider>
);
```

### Retrieve a runtime instance

```ts !#3
import { useRuntime } from "@squide/firefly";

const runtime = useRuntime();

runtime.logger.debug("Hello!");
```



