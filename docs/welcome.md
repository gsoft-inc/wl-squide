# API

## @squide/react-router

### Runtime

#### class Runtime({ loggers, services, sessionAccessor })

{% code title="boostrap.ts" overflow="wrap" lineNumbers="true" fullWidth="true" %}
```ts
import { Runtime } from "@squide/react-router";

const runtime = new Runtime({
    loggers: [],
    services: {},
    sessionAccessor: () => {}
});

runtime.registerRoutes([
    {
        path: "/page-1",
        element: <Page />
    }
]);

const routes = runtime.routes;

runtime.registerNavigationItems([
    {
        to: "/page-1",
        content: "Page 1"
    }
]);

const navigationItems = runtime.navigationItems;

const logger = runtime.logger;

const eventBus = runtime.eventBus;

const service = runtime.getService("serviceName") as TService;

const session = runtime.getSession() as TSession;
```
{% endcode %}

## @squide/webpack-module-federation

## @squide/fake
