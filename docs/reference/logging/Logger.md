# Logger

A basic logger interface.

## Usage

```ts
import { Logger } from "@squide/react-router";

class CustomLogger: Logger {
    debug(log) { ... }
    information(log) { ... }
    warning(log) { ... }
    error(log) { ... }
    critical(log) { ... }
}
```
