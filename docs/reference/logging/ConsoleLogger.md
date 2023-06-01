# ConsoleLogger

A basic console logger.

## Reference

```ts
const logger = new ConsoleLogger(logLevel?)
```

### Parameters

- `logLevel`: An optional minimum level for the logger to output a log entry to the console (default is `LogLevel.critical`).

## Usage

```ts
import { ConsoleLogger, type LogLevel } from "@squide/react-router";

const logger = new ConsoleLogger(Loglevel.debug);

logger.debug("Debug log", { foo: "bar" });
logger.information("Info log");
logger.warning("Warning log");
logger.error("Error log");
logger.critical("Critical log");
```
