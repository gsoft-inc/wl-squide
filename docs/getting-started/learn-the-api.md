---
order: 60
---

# Learn the API

Now that we've created an host application, loaded a few modules and registered routes and navigation items, let's dive into the APIs that are available with this shell.

!!!info
For an exhaustive list of `@squide` API, have a look at the [References](/references#api) section.
!!!

## Logging

`@squide` comes with a native logging feature integrated with the [Runtime](/references/runtime/runtime-class.md) class and the [useLogger](/references/runtime/useLogger.md) hook.

First, register your own custom logger by implementing the [Logger](/references/logging/Logger.md) interface or with `@squide` native [ConsoleLogger](/references/logging/ConsoleLogger):

```ts host/src/bootstrap.tsx
import { Runtime, ConsoleLogger, type LogLevel } from "@squide/react-router";

const runtime = new Runtime({
    loggers: [new ConsoleLogger(LogLevel.debug)]
});
```

Then, log entries any parts of your federated application with the [useLogger](/references/runtime/useLogger.md) hook:

```ts
import { useLogger } from "@squide/react-router";

const logger = useLogger();

logger.debug("Hello", { world: "!" });
```

The logger is also available from the [Runtime](/references/runtime/runtime-class.md) instance.

## Messaging

It's important that the parts of a federated application remains loosely coupled. To help with that, `@squide` offers a native [Event Bus](/references/messaging/EventBus.md) functionality.

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

The event bus is also available from the [Runtime](/references/runtime/runtime-class.md) instance.

## Authentication

Most of our applications (if not all) will eventually requires the user to authenticate. To support that, `@squide` [Runtime](/references/runtime/runtime-class.md) class accept a [sessionAccessor](/references/fakes/SessionManager.md#integrate-with-a-runtime-instance) function that will be made available to every parts of the application.

First, create a [sessionAccessor](/references/fakes/SessionManager.md#integrate-with-a-runtime-instance) function:

```ts host/src/session.ts
import type { SessionAccessorFunction } from "@squide/react-router";
import { SessionManager } from "@squide/fakes";

const sessionAccessor: SessionAccessorFunction = () => {
    return sessionManager.getSession();
};
```

!!!warning
Our security department reminds you to not use a fake `SessionManager` in a production application :blush:
!!!

Then register the accessor function:

```ts host/src/boostrap.tsx
import { Runtime } from "@squide/react-router";
import { sessionAccessor } from "./session.ts";

const runtime = new Runtime({
    sessionAccessor
});
```

Finally, retrieve the session from any parts of the application with the [useSession](/references/runtime/useSession) hook:

```ts
import { useSession } from "@squide/react-router";

const session = useSession();
```

The session is also available from the [Runtime](/references/runtime/runtime-class.md) instance.

## Services

`@squide` offers a few built-in services, however, by no mean these services alone can support the needs of every mature application. That's why custom services can be added to the shell [Runtime](/references/runtime/runtime-class.md).

First, make the service available to every part of the application by passing a service instance to the [Runtime](/references/runtime/runtime-class.md) instance:

```ts host/src/boostrap.tsx
import { Runtime } from "@squide/react-router";
import { UserService } from "@sample/shared";

const runtime = new Runtime({
    services: {
        "user-service": new UserService()
    }
});
```

Then, retrieve the service instance from anywhere with the [useService](/references/runtime/useService.md) hook:

```ts
import { useService } from "@squide/react-router";
import { type UserService } from "@sample/shared";

const service = useService("user-service") as UserService;
```

The services are also available from the [Runtime](/references/runtime/runtime-class.md) instance.



