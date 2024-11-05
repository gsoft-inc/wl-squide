# Logger

An abstract base class to define a logger.

## Usage

### Define a custom logger

```ts
import { Logger, type Runtime } from "@squide/firefly";

export class CustomLogger implements Logger {
    constructor(runtime: Runtime) {
        super(CustomLogger.name, runtime);
    }

    debug(log) { ... }
    information(log) { ... }
    warning(log) { ... }
    error(log) { ... }
    critical(log) { ... }
}
```
