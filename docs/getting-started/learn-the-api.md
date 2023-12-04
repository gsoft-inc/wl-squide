---
order: 50
---

# Learn the API

Now that we've created a host application, loaded a few modules and registered routes and navigation items, let's delve into the APIs provided by this shell.

## Runtime mode

In an effort to optimize the development experience, Squide can be bootstrapped in `development` or `production` mode:

```ts host/src/bootstrap.tsx
import { FireflyRuntime, ConsoleLogger, type LogLevel } from "@squide/firefly";

const runtime = new FireflyRuntime({
    mode: "production"
});
```

By default, the Runtime [mode](../reference/runtime/runtime-class.md#change-the-runtime-mode) is `development`.

## Logging

Squide includes a built-in logging feature that integrates with the [FireflyRuntime](/reference/runtime/runtime-class.md) class and the [useLogger](/reference/runtime/useLogger.md) hook.

First, register your own custom logger by implementing the [Logger](/reference/logging/Logger.md) interface or register Squide built-in [ConsoleLogger](/reference/logging/ConsoleLogger):

```ts host/src/bootstrap.tsx
import { FireflyRuntime, ConsoleLogger, type LogLevel } from "@squide/firefly";

const runtime = new FireflyRuntime({
    loggers: [new ConsoleLogger(LogLevel.debug)]
});
```

Then, log entries from any parts of your federated application with the `useLogger` hook:

```ts
import { useLogger } from "@squide/firefly";

const logger = useLogger();

logger.debug("Hello", { world: "!" });
```

The logger is also available from the [FireflyRuntime](/reference/runtime/runtime-class.md#use-the-logger) instance.

## Messaging

It's crucial that the parts of a federated application remains loosely coupled. To help with that, Squide offers a built-in [Event Bus](/reference/messaging/EventBus.md).

First, listen to an event with the [useEventBusListener](/reference/messaging/useEventBusListener.md) hook:

```ts
import { useCallback } from "react";
import { useEventBusListener } from "@squide/firefly";

const handleFoo = useCallback((data, context) => {
    // do something...
}, []);

useEventBusListener("foo", handleFoo);
```

Then, dispatch an event from anywhere with the [useEventBusDispatcher](/reference/messaging/useEventBusDispatcher.md) hook:

```ts
import { useEventDispatcher } from "@squide/firefly";

const dispatch = useEventBusDispatcher();

dispatch("foo", "bar");
```

You can use the event bus to enable various communication scenarios, such as notifying components of state changes, broadcasting messages across modules, or triggering actions based on specific events.

The event bus is also available from the [FireflyRuntime](/reference/runtime/runtime-class.md#use-the-event-bus) instance.

## Session

Most of our applications (if not all) will eventually require the user to authenticate. To facilitate this process, the Squide [FireflyRuntime](/reference/runtime/runtime-class.md) class accepts a [sessionAccessor](/reference/fakes/localStorageSessionManager.md#integrate-with-a-runtime-instance) function. Once the shell registration flow is completed, the function will be made accessible to every module of the application.

First, define a `sessionAccessor` function:

```ts host/src/session.ts
import type { SessionAccessorFunction } from "@squide/firefly";
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
import { FireflyRuntime } from "@squide/firefly";
import { sessionAccessor } from "./session.ts";

const runtime = new FireflyRuntime({
    sessionAccessor
});
```

Finally, access the session from any parts of the application with the [useSession](/reference/runtime/useSession.md) hook:

```ts
import { useSession } from "@squide/firefly";

const session = useSession();
```

Or determine whether or not the user is authenticated with the [useIsAuthenticated](/reference/session/useIsAuthenticated.md) hook:

```ts
import { useIsAuthenticated } from "@squide/firefly";

const isAuthenticated = useIsAuthenticated();
```

The session is also available from the [FireflyRuntime](/reference/runtime/runtime-class.md) instance.

## Plugins

To keep Squide lightweight, not all functionalities should be integrated as a core functionality. However, to accommodate a broad range of technologies, a [plugin system](../reference/plugins/plugin.md) has been implemented to fill the gap.

Plugins can be registered at bootstrapping with the [FireflyRuntime](../reference/runtime/runtime-class.md) instance:

```ts host/src/boostrap.tsx
import { FireflyRuntime } from "@squide/firefly";
import { MyPlugin } from "@sample/my-plugin";

const runtime = new FireflyRuntime({
    plugins: [new MyPlugin()]
});
```

Then, the plugins can be accessed anywhere from the `FireflyRuntime` instance:

```ts
import { MyPlugin } from "@sample/my-plugin";

const myPlugin = runtime.getPlugin(MyPlugin.name) as MyPlugin;
```

## Fakes

Take a look at the [fake implementations](../reference/default.md#fakes). These implementations are designed to facilitate the set up of a module isolated environment.

## Guides

Explore the [guides](../guides/default.md) section to learn about Squide advanced features.

Be sure to read, at a minimum, the following guides:

- [Setup Mock Service Worker](../guides/setup-msw.md)
- [Fetch initial data](../guides/fetch-initial-data.md)
- [Fetch page data](../guides/fetch-page-data.md)
- [Manage shared state](../guides/manage-shared-state.md)
- [Isolate module failures](../guides/isolate-module-failures.md)
- [Add authentication](../guides/add-authentication.md)
- [Add a shared dependency](../guides/add-a-shared-dependency.md)

## Reference

For a comprehensive list of the Squide API, refer to the [reference](../reference/default.md) section.
