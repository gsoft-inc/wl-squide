---
order: 60
---

# Learn the API

Now that we've created a host application, loaded a few modules and registered routes and navigation items, let's delve into the APIs provided by this shell.

!!!info
For a comprehensive list of the Squide API, refer to the [References](/reference#api) section.
!!!

## Runtime mode

In an effort to optimize the development experience, Squide can be bootstrapped in `development` or `production` mode:

```ts host/src/bootstrap.tsx
import { Runtime, ConsoleLogger, type LogLevel } from "@squide/react-router";

const runtime = new Runtime({
    mode: "production"
});
```

By default, the Runtime [mode](../reference/runtime/runtime-class.md#change-the-runtime-mode) is `development`.

## Logging

Squide includes a built-in logging feature that integrates with the [Runtime](/reference/runtime/runtime-class.md) class and the [useLogger](/reference/runtime/useLogger.md) hook.

First, register your own custom logger by implementing the [Logger](/reference/logging/Logger.md) interface or register Squide built-in [ConsoleLogger](/reference/logging/ConsoleLogger):

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

The logger is also available from the [Runtime](/reference/runtime/runtime-class.md#use-the-logger) instance.

## Messaging

It's crucial that the parts of a federated application remains loosely coupled. To help with that, Squide offers a built-in [Event Bus](/reference/messaging/EventBus.md).

First, listen to an event with the [useEventBusListener](/reference/messaging/useEventBusListener.md) hook:

```ts
import { useCallback } from "react";
import { useEventBusListener } from "@squide/react-router";

const handleFoo = useCallback((data, context) => {
    // do something...
}, []);

useEventBusListener("foo", handleFoo);
```

Then, dispatch an event from anywhere with the [useEventBusDispatcher](/reference/messaging/useEventBusDispatcher.md) hook:

```ts
import { useEventDispatcher } from "@squide/react-router";

const dispatch = useEventBusDispatcher();

dispatch("foo", "bar");
```

You can use the event bus to enable various communication scenarios, such as notifying components of state changes, broadcasting messages across modules, or triggering actions based on specific events.

The event bus is also available from the [Runtime](/reference/runtime/runtime-class.md#use-the-event-bus) instance.

## Session

Most of our applications (if not all) will eventually require the user to authenticate. To facilitate this process, the Squide [Runtime](/reference/runtime/runtime-class.md) class accepts a [sessionAccessor](/reference/fakes/LocalStorageSessionManager.md#integrate-with-a-runtime-instance) function. Once the shell registration flow is completed, the function will be made accessible to every module of the application.

First, define a `sessionAccessor` function:

```ts host/src/session.ts
import type { SessionAccessorFunction } from "@squide/react-router";
import { LocalStorageSessionManager } from "@squide/fakes";

export const sessionManager = new LocalStorageSessionManager<Session>();

const sessionAccessor: SessionAccessorFunction = () => {
    return sessionManager.getSession();
};
```

!!!warning
Our security department reminds you to refrain from using a fake `LocalStorageSessionManager` in a production application :blush:
!!!

Then register the accessor function:

```ts host/src/boostrap.tsx
import { Runtime } from "@squide/react-router";
import { sessionAccessor } from "./session.ts";

const runtime = new Runtime({
    sessionAccessor
});
```

Finally, access the session from any parts of the application with the [useSession](/reference/runtime/useSession.md) hook:

```ts
import { useSession } from "@squide/react-router";

const session = useSession();
```

Or determine whether or not the user is authenticated with the [useIsAuthenticated](/reference/session/useIsAuthenticated.md) hook:

```ts
import { useIsAuthenticated } from "@squide/react-router";

const isAuthenticated = useIsAuthenticated();
```

The session is also available from the [Runtime](/reference/runtime/runtime-class.md) instance.

## Plugins

To keep Squide lightweight, not all functionalities should be integrated as a core functionality. However, to accommodate a broad range of technologies, a plugin system has been implemented to fill the gap.

First, define a plugin by implementing the [Plugin](../reference/plugins/plugin.md) interface:

```ts !#4 shared/src/mswPlugin.ts
import { Plugin } from "@squide/react-router";
import type { RestHandler } from "msw";

export class MswPlugin extends Plugin {
    constructor() {
        super(MswPlugin.name);
    }

    registerRequestHandlers(handlers: RestHandler[]) {
        ...
    }
}
```

Then, make the plugin available to every part of the application by passing a service instance to the `Runtime` instance:

```ts !#5 host/src/boostrap.tsx
import { Runtime } from "@squide/react-router";
import { MswPlugin } from "@squide/msw";

const runtime = new Runtime({
    plugins: [new MswPlugin()]
});
```

Then, access the plugin instance from the [Runtime](/reference/runtime/runtime-class.md) instance:

```ts !#4
import { MswPlugin } from "@sample/shared";
import { requetHandlers } from "../mocks/handlers.ts";

const mswPlugin = runtime.getPlugin(MswPlugin.name) as MswPlugin;
```

## Fakes

For development purposes, have a look at the available [fake implementations](../reference/default.md#fakes).

