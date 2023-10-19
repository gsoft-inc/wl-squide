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

<!-- ## Plugins

To keep Squide lightweight, not all functionalities should be integrated as a core functionality. However, to accommodate a broad range of technologies, a plugin system has been implemented to fill the gap.

First, define a plugin by implementing the [Plugin](../reference/plugins/plugin.md) interface:

```ts shared/src/mswPlugin.ts
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

```ts host/src/boostrap.tsx
import { Runtime } from "@squide/react-router";
import { MswPlugin } from "@squide/msw";

const runtime = new Runtime({
    plugins: [new MswPlugin()]
});
```

Then, access the plugin instance from the [Runtime](/reference/runtime/runtime-class.md) instance:

```ts
import { MswPlugin } from "@sample/shared";
import { requetHandlers } from "../mocks/handlers.ts";

const mswPlugin = runtime.getPlugin(MswPlugin.name) as MswPlugin;
``` -->

## Mock Service Worker

We recommend to mock the API endpoints with [Mock Service Worker](https://mswjs.io/) (MSW) to faciliate the development and encourage an [Contract Design First](https://devblogs.microsoft.com/ise/2023/05/08/design-api-first-with-typespec/) approach.

To help with that, a `@squide/msw` package is available.

First, install the plugin, then [register the plugin](../reference/msw/MswPlugin.md#register-the-plugin) at bootstrap:

```ts host/src/boostrap.tsx
import { Runtime } from "@squide/react-router";
import { MswPlugin } from "@squide/msw";

const runtime = new Runtime({
    plugins: [new MswPlugin()]
});
```

Then, [register the modules MSW request handlers](../reference/msw/MswPlugin.md#register-request-handlers) at registration:

```ts !#12 remote-module/src/register.tsx
import { getMswPlugin } from "@squide/msw";
import type { ModuleRegisterFunction, Runtime } from "@squide/react-router"; 

export const register: ModuleRegisterFunction<Runtime> = async runtime => {
    if (process.env.USE_MSW) {
        const mswPlugin = getMswPlugin(runtime);

        // Files including an import to the "msw" package are included dynamically to prevent adding
        // MSW stuff to the bundled when it's not used.
        const requestHandlers = (await import("../mocks/handlers.ts")).requestHandlers;

        mswPlugin.registerRequestHandlers(requestHandlers);
    }
}
```

!!!info
Don't forget to mark the registration function as `async` since there's a dynamic import.
!!!

Then, [retrieve the modules MSW request handlers](../reference/msw/MswPlugin.md#retrieve-the-request-handlers) in the host application and start MSW:

```ts !#9,12
import { registerRemoteModules } from "@squide/webpack-module-federation";
import { setMswAsStarted } from "@squide/msw";

registerRemoteModules(Remotes, runtime).then(() => {
    if (process.env.USE_MSW) {
        // Files including an import to the "msw" package are included dynamically to prevent adding
        // MSW stuff to the bundled when it's not used.
        import("../mocks/browser.ts").then(({ startMsw }) => {
            // Will start MSW with the request handlers provided by every module.
            startMsw(mswPlugin.requestHandlers);

            // Indicate to resources that are dependent on MSW that the service has been started.
            setMswAsStarted();
        });
    }
});
```

Finally, make sure that the [application rendering is delayed](../reference/msw/useIsMswReady.md) until MSW is started:

```ts !#3 host/src/App.tsx
import { useIsMswStarted } from "@squide/msw";

const isMswReady = useIsMswStarted(process.env.USE_MSW);

if (!isMswReady) {
    return <div>Loading...</div>
}
```

## Fakes

For development purposes, have a look at the available [fake implementations](../reference/default.md#fakes).

