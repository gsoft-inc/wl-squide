---
order: 60
---

# Learn the API

Now that we've created a host application, loaded a few modules and registered routes and navigation items, let's delve into the APIs provided by this shell.

!!!info
For a comprehensive list of the `@squide` API, refer to the [References](/references#api) section.
!!!

## Logging

`@squide` includes a built-in logging feature that integrates with the [Runtime](/references/runtime/runtime-class.md) class and the [useLogger](/references/runtime/useLogger.md) hook.

First, register your own custom logger by implementing the [Logger](/references/logging/Logger.md) interface or register `@squide` built-in [ConsoleLogger](/references/logging/ConsoleLogger):

```ts host/src/bootstrap.tsx
import { Runtime, ConsoleLogger, type LogLevel } from "@squide/react-router";

const runtime = new Runtime({
    loggers: [new ConsoleLogger(LogLevel.debug)]
});
```

Then, log entries from any parts of your federated application with the `useLogger` hook:

```ts
import { useLogger } from "@squide/react-router";

const logger = useLogger();

logger.debug("Hello", { world: "!" });
```

The logger is also available from the [Runtime](/references/runtime/runtime-class.md) instance.

## Messaging

It's crucial that the parts of a federated application remains loosely coupled. To help with that, `@squide` offers a built-in [Event Bus](/references/messaging/EventBus.md).

First, listen to an event with the [useEventBusListener](/references/messaging/useEventBusListener.md) hook:

```ts
import { useCallback } from "react";
import { useEventBusListener } from "@squide/react-router";

const handleFoo = useCallback((data, context) => {
    // do something...
}, []);

useEventBusListener("foo", handleFoo);
```

Then, dispatch an event from anywhere with the [useEventBusDispatcher](/references/messaging/useEventBusDispatcher.md) hook:

```ts
import { useEventDispatcher } from "@squide/react-router";

const dispatch = useEventBusDispatcher();

dispatch("foo", "bar");
```

You can use the event bus to enable various communication scenarios, such as notifying components of state changes, broadcasting messages across modules, or triggering actions based on specific events.

The event bus is also available from the [Runtime](/references/runtime/runtime-class.md) instance.

## Session

Most of our applications (if not all) will eventually require the user to authenticate. To facilitate this process, the `@squide` [Runtime](/references/runtime/runtime-class.md) class accepts a [sessionAccessor](/references/fakes/SessionManager.md#integrate-with-a-runtime-instance) function. Once the shell registration flow is completed, the function will be made accessible to every module of the application.

First, let's define a `sessionAccessor` function:

```ts host/src/session.ts
import type { SessionAccessorFunction } from "@squide/react-router";
import { SessionManager } from "@squide/fakes";

export const sessionManager = new SessionManager<Session>();

const sessionAccessor: SessionAccessorFunction = () => {
    return sessionManager.getSession();
};
```

!!!warning
Our security department reminds you to refrain from using a fake `SessionManager` in a production application :blush:
!!!

Then register the accessor function:

```ts host/src/boostrap.tsx
import { Runtime } from "@squide/react-router";
import { sessionAccessor } from "./session.ts";

const runtime = new Runtime({
    sessionAccessor
});
```

Finally, access the session from any parts of the application with the [useSession](/references/runtime/useSession.md) hook:

```ts
import { useSession } from "@squide/react-router";

const session = useSession();
```

Or determine whether or not the user is authenticated with the [useIsAuthenticated](/references/session/useIsAuthenticated.md) hook:

```ts
import { useIsAuthenticated } from "@squide/react-router";

const isAuthenticated = useIsAuthenticated();
```

The session is also available from the [Runtime](/references/runtime/runtime-class.md) instance.

## Services

While `@squide` provides a range of built-in functionalities, by no mean these alone can support the needs of every mature application. Therefore, the shell [Runtime](/references/runtime/runtime-class.md) allows the addition of custom services.

First, make the service available to every part of the application by passing a service instance to the `Runtime` instance:

```ts host/src/boostrap.tsx
import { Runtime } from "@squide/react-router";
import { UserService } from "@sample/shared";

const runtime = new Runtime({
    services: {
        "user-service": new UserService()
    }
});
```

Then, access the service instance from anywhere with the [useService](/references/runtime/useService.md) hook:

```ts
import { useService } from "@squide/react-router";
import { type UserService } from "@sample/shared";

const service = useService("user-service") as UserService;
```

The services are also available from the [Runtime](/references/runtime/runtime-class.md) instance.



