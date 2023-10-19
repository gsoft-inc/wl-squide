# Logger

An abstract base class to define a logger.

## Usage

### Define a custom logger

```ts
import { Logger } from "@squide/react-router";

export class CustomLogger: Logger {
    debug(log) { ... }
    information(log) { ... }
    warning(log) { ... }
    error(log) { ... }
    critical(log) { ... }
}
```
