---
label: Runtime
---

# Runtime

A runtime instance gives modules access to functionalities such as routing and navigation.

## Reference

```ts
const runtime = new Runtime({ loggers?: [], services?: {}, sessionAccessor?: () => {} });
```

### Parameters

- `options`: An optional object of options.
    - `loggers`: An optional array of `Logger` instances.
    - `services`: An optional string-keyed object literal of custom service instances.
    - `sessionAccessor`: An optional function returning the current session.

## Usage

!!!info Info
Also have a look at [useRuntime](), [useRoutes](), [useNavigationItems](), [useLogger](), [useService]().
!!!

### Create a Runtime instance

```ts
import { ConsoleLogger, Runtime } from "@squide/react-router";
import { SessionManager } from "@squide/fakes";
import { TrackingService } from "@sample/shared";

const runtime = new Runtime({
    loggers: [new ConsoleLogger()],
    services: {
        "userService": new UserService()
    },
    sessionAccessor: () => {
        return sessionManager.getSession();
    };
});
```

### Register routes

```ts
// Register a new route from a local or remote module.
runtime.registerRoutes([
    {
        path: "/page-1",
        element: <Page />
    }
]);

// Access all the registered routes.
const routes = runtime.routes;
```

### Register navigation items

```ts
// Register a new navigation item from a local or remote module.
runtime.registerNavigationItems([
    {
        to: "/page-1",
        content: "Page 1"
    }
]);

// Access all the registered navigation items.
const navigationItems = runtime.navigationItems;
```

### Use the logger

```ts
// Write a debug log entry.
// If the runtime has been instanciated with multiple logger instances, every logger instance will be be called.
runtime.logger.debug("Hello!");
```

### Use the event bus

```ts
// Listen to an event dispatch by the host application or a module.
runtime.eventBus.addListener("write-to-host", () => {});

// Dispatch an event to the host application or a module.
runtime.eventBus.dispatch("write-to-host", "Hello host!");
```

### Retrieve a service

```ts
// If the service isn't registered, an Error instance will be thrown.
const service = runtime.getService("userService") as TService;
```

### Retrive the current session

```ts
// If no sessionAccessor has been provided, an Error instance will be thrown.
const session = runtime.getSession() as TSession;
```
