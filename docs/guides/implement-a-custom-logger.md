---
order: 60
---

# Implement a custom logger

Many applications must integrate with specific remote logging solutions like [Honeycomb](https://www.honeycomb.io/) and [Azure Application Insights](https://learn.microsoft.com/en-us/azure/azure-monitor/app/app-insights-overview). To help with that, the shell runtime accepts any custom loggers that implement the [Logger](/references/logging/Logger.md) interface.

First, let's define a custom logger:

```ts host/src/customerLogger.ts
import { LogLevel, type Logger } from "@squide/react-router";

export class CustomLogger implements Logger {
    readonly #logLevel: LogLevel;

    constructor(logLevel: LogLevel = LogLevel.critical) {
        this.#logLevel = logLevel;
    }

    debug(log: string, ...rest: unknown[]): Promise<unknown> {
        if (this.#logLevel >= LogLevel.debug) {
            console.log(`[custom-logger] ${log}`, ...rest);
        }

        return Promise.resolve();
    }

    information(log: string, ...rest: unknown[]): Promise<unknown> {
        if (this.#logLevel >= LogLevel.information) {
            console.info(`[custom-logger] ${log}`, ...rest);
        }

        return Promise.resolve();
    }

    warning(log: string, ...rest: unknown[]): Promise<unknown> {
        if (this.#logLevel >= LogLevel.warning) {
            console.warn(`[custom-logger] ${log}`, ...rest);
        }

        return Promise.resolve();
    }

    error(log: string, ...rest: unknown[]): Promise<unknown> {
        if (this.#logLevel >= LogLevel.error) {
            console.error(`[custom-logger] ${log}`, ...rest);
        }

        return Promise.resolve();
    }

    critical(log: string, ...rest: unknown[]): Promise<unknown> {
        if (this.#logLevel >= LogLevel.critical) {
            console.error(`[custom-logger] ${log}`, ...rest);
        }

        return Promise.resolve();
    }
}
```

 Then create a [Runtime](/references/runtime/runtime-class.md) instance with an instance of the new `CustomLogger`:

```ts host/src/bootstrap.tsx
import { Runtime } from "@squide/react-router";
import { CustomLogger } from "./customLogger.ts";

const runtime = new Runtime({
    loggers: [
        new CustomLogger()
    ],
});
```

Start the applications and open the dev tools. Refresh the page. The console logs should be displayed:

```
> [custom-logger] [shell] Found 1 remote modules to register.
```


