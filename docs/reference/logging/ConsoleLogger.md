---
toc:
    depth: 2-3
---

# ConsoleLogger

A basic console logger.

## Reference

```ts
const logger = new ConsoleLogger(runtime, logLevel?)
```

### Parameters

- `logLevel`: An optional minimum level for the logger to output a log entry to the console (default is `LogLevel.debug`).

## Usage

### Log everything

```ts
import { FireflyRuntime, ConsoleLogger, type LogLevel } from "@squide/firefly";

const logger = new ConsoleLogger(new FireflyRuntime());

logger.debug("Debug log", { foo: "bar" });
logger.information("Info log");
logger.warning("Warning log");
logger.error("Error log");
logger.critical("Critical log");
```

### Only log errors

To restrict the logs to `error` or `critical`, change the minimum log level to `error`:

```ts
import { FireflyRuntime, ConsoleLogger, type LogLevel } from "@squide/firefly";

const logger = new ConsoleLogger(new FireflyRuntime(), LogLevel.error);

logger.error("Error log");
logger.critical("Critical log");
```


