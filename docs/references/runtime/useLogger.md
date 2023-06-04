# useLogger

Retrieve a `RuntimeLogger` instance from the `Runtime` instance provided by `RuntimeContext`.

## Reference

```ts
const logger = useLogger()
```

### Parameters

None

### Returns

A `RuntimeLogger` instance.

## Usage

```ts
import { useLogger } from "@squide/react-router";

const logger = useLogger();

logger.debug("Hello", { world: "!" });
```
