# useLogger

Retrieve a `RuntimeLogger` instance from the `Runtime` instance provided by `RuntimeContext`.

## Reference

```ts
useLogger()
```

### Parameters

None

### Returns

A `RuntimeLogger` instance.

## Usage

```ts !#3
import { useLogger } from "@squide/react-router";

const logger = useLogger();

logger.debug("Hello!");
```

```tsx !#5 bootstrap.tsx
import { createRoot } from "react-dom/client";
import { ConsoleLogger, Runtime, RuntimeContext } from "@squide/react-router";

const runtime = new Runtime({
    loggers: [new ConsoleLogger()]
});

const root = createRoot(document.getElementById("root"));

root.render(
    <RuntimeContext.Provider value={runtime}>
        <App />
    </RuntimeContext.Provider>
);
```
