---
order: 100
toc:
    depth: 2-3
---

# Runtime class

A runtime instance give modules access to functionalities such as routing, navigation and logging.

## Reference

```ts
const runtime = new Runtime(options?: { loggers?: [], services?: [], plugins?: [], sessionAccessor?: () => {} })
```

### Parameters

- `options`: An optional object literal of options:
    - `mode`: An optional mode to optimize Squide for `production`. Values are `"development"` (default) and `"production"`.
    - `loggers`: An optional array of `Logger` instances.
    - `services`: An optional array of custom service instances.
    - `plugins`: An optional array of custom plugin instances.
    - `sessionAccessor`: An optional function returning the current session.

## Usage

### Create a `Runtime` instance

```ts
import { ConsoleLogger, Runtime } from "@squide/react-router";
import { LocalStorageSessionManager } from "@squide/fakes";
import { MswPlugin } from "@squide/msw";
import { TelemetryService, type AppSession } from "@sample/shared";

const sessionManager = new LocalStorageSessionManager();

const runtime = new Runtime({
    loggers: [new ConsoleLogger()],
    services: [new TelemetryService()],
    plugins: [new MswPlugin()],
    sessionAccessor: () => {
        return sessionManager.getSession();
    };
});
```

### Change the runtime mode

```ts
import { Runtime } from "@squide/react-router";

const runtime = new Runtime({
    mode: "production"
});
```

### Register routes

```ts
runtime.registerRoute(route, options?: {})
```

- `options`: An optional object literal of options:
    - `parentPath`: An optional path of a parent route to register this new route under.
    - `parentName`: An optional name of a parent route to register this new route under.

A Squide route can either be a `RootRoute` or a `Route`.

- `RootRoute`: accept any properties of a React Router [Route](https://reactrouter.com/en/main/components/route) component with the addition of:
    - `hoist`: An optional boolean value to register the route at the root of the router. The default value is `false`.
    - `visibility`: An optional visibility indicator for the route. Values are `public` or `authenticated` and the default value is `authenticated`.
    - `name`: An optional name for the route.
- `Route`: accept any properties of a React Router [Route](https://reactrouter.com/en/main/components/route) component with the addition of:
    - `name`: An optional name for the route.

```tsx
import { Page } from "./Page.tsx"

// Register a new route from a local or remote module.
runtime.registerRoute({
    path: "/page-1",
    element: <Page />
});
```

### Register an hoisted route

Unlike a regular page, a hoisted page is added at the root of the router, outside of the boundaries of the host application's root layout. This means that a hoisted page has full control over its rendering.

```tsx !#6
import { Page } from "./Page.tsx";

runtime.registerRoute({
    path: "/page-1",
    element: <Page />
}, {
    hoist: true
});
```

[!ref text="Setup the host application to accept hoisted routes"](/reference/routing/useHoistedRoutes.md)

### Register a public route

When registering a route, a hint can be provided to indicate if the route is intended to be displayed as a `public` or `authenticated` route. This is especially useful when dealing with code that conditionally fetch data for authenticated routes.

```tsx !#6
import { Page } from "./Page.tsx";

runtime.registerRoute({
    path: "/page-1",
    element: <Page />,
    visibility: "public"
});
```

### Register a named route

The `registerRoute` function accepts a `parentName` property, allowing a route to be [nested under an existing parent route](#register-nested-routes-under-an-existing-route). When searching for the parent route matching the `parentName` property, the `parentName` will be matched against the `name` property of every route.

> A `name` property should usually only be defined for routes that doesn't have a path like an error boundary or an authentication boundary.

```tsx !#4
import { RootErrorBoundary } from "./Page.tsx";

runtime.registerRoute({
    name: "error-boundary",
    element: <RootErrorBoundary />
});
```

### Register nested routes under an existing route

React router [nested routes](https://reactrouter.com/en/main/start/tutorial#nested-routes) enable applications to render nested layouts at various points within the router tree. This is quite helpful for federated applications as it enables composable and decoupled UI.

To fully harness the power of nested routes, the `registerRoute` function allows a route to be registered **under any** previously **registered route**, even if that route was registered by another module. The only requirement is that the **parent route** must have been registered with the `registerRoute` function.

When registering a new route with the `registerRoute` function, to render the route under a parent route, specify a `parentPath` property that matches the parent route's `path` property:

```tsx !#7
import { Page } from "./Page.tsx";

runtime.registerRoute({
    path: "/layout/page-1",
    element: <Page />
}, { 
    parentPath: "/layout" // Register the page under an existing route having "/layout" as its "path".
});
```

Or a `parentName` property that matches the parent route's `name` property:

```tsx !#7
import { Page } from "./Page.tsx";

runtime.registerRoute({
    path: "/page-1",
    element: <Page />
}, { 
    parentName: "error-boundary" // Register the page under an existing route having "error-boundary" as its "name".
});
```

!!!info
Likewise any other React Router routes, the `path` property of a page rendered under an existing parent route must be an absolute path. For example, if a parent route `path` is `/layout`, the `path` property of a page rendered under that parent route and responding to the `/page-1` url, should be `/layout/page-1`.
!!!

### Retrieve routes

A federated application routes are accessible from a `Runtime` instance, but keep in mind that the preferred way to retrieve the routes is with the [useRoutes](./useRoutes) hook.

```tsx
const routes = runtime.routes;
```

### Register navigation items

```ts
runtime.registerNavigationItem(item, options?: {})
```

- `options`: An optional object literal of options:
    - `menuId`: An optional menu id to associate the item with.

A Squide navigation item can either be a `NavigationLink` or a `NavigationSection`. Both types can be intertwined to create a multi-level menu hierarchy. A `NavigationSection` item is used to setup a new level while a `NavigationLink` define a link.

- `NavigationSection` accept the following properties:
    - `label`: The section text.
    - `children`: The section content.
    - `priority`: An order priority affecting the position of the item in the menu (higher first)
    - `addiltionalProps`: Additional properties to be forwarded to the section renderer.
- `NavigationLink` accept any properties of a React Router [Link](https://reactrouter.com/en/main/components/link) component with the addition of:
    - `label`: The link text.
    - `priority`: An order priority affecting the position of the item in the menu (higher first)
    - `additionalProps`: Additional properties to be forwarded to the link renderer.

```ts
// Register a new navigation item from a local or remote module.
runtime.registerNavigationItem({
    to: "/page-1",
    label: "Page 1"
});
```

[!ref text="Setup the host application to render navigation items"](/reference/routing/useRenderedNavigationItems.md)

### Register nested navigation items

```ts
// Register the following menu hierarchy:
//
//  Section
//  --- Nested Section
//  ------- Nested Nested Link
//  --- Nested Link
//  Link
runtime.registerNavigationItem({
    label: "Section",
    children: [
        {
            label: "Nested Section",
            children: [
                {
                    to: "#",
                    label: "Nested Nested Link",
                }
            ]
        },
        {
            to: "#",
            label: "Nested Link"
        }
    ]
},
{
    to: "#",
    label: "Link"
});
```

### Sort registered navigation items

A `priority` property can be added to a navigation item to affect it's position in the menu. The sorting algorithm is as follow:

- By default a navigation item have a priority of `0`.
- If no navigation item have a priority, the items are positioned according to their registration order.
- If an item have a priority `> 0`, the item will be positioned before any other items with a lower priority (or without an explicit priority value).
- If an item have a priority `< 0`, the item will be positioned after any other items with a higher priority (or without an explicit priority value).

```ts !#4,12
runtime.registerNavigationItem({
    to: "/about",
    label: "About",
    priority: 10
});

runtime.registerNavigationItem({
    to: "/home",
    label: "Home",
    // Because the "Home" navigation item has an higher priority, it will be rendered
    // before the "About" navigation item.
    priority: 100
});
```

### Use a React element as navigation item label

```tsx !#5-8
import { QuestionMarkIcon } from "@sample/icons";

runtime.registerNavigationItem({
    to: "/about",
    label: (
        <QuestionMarkIcon />
        <span>About</span>
    )
});
```

### Style a navigation item

```ts !#4-6
runtime.registerNavigationItem({
    to: "/about",
    label: "About",
    style: {
        backgroundColor: "#000"
    }
});
```

### Open a navigation link in a new tab

```ts !#4
runtime.registerNavigationItem({
    to: "/about",
    label: "About",
    target: "_blank"
});
```

### Render additional props on a navigation item

```ts !#4-6
runtime.registerNavigationItem({
        to: "/about",
        label: "About",
        additionalProps: {
            highlight: true
        }
    });
```

### Register navigation items for a specific menu

By default, every navigation item registered with the `registerNavigationItem` function is registered as part of the `root` navigation menu. To register a navigation item for a different navigation menu, specify a `menuId` property when registering the items.

```tsx !#5
runtime.registerNavigationItem({
    to: "/layout/page-1",
    label: "Page 1"
}, { 
    menuId: "my-custom-layout" 
});
```

### Retrieve navigation items

A federated application navigation items are accessible from a `Runtime` instance, but keep in mind that the preferred way to retrieve the navigation items is with the [useNavigationItems](./useNavigationItems) hook.

By default, the `getNavigationItems` will return the navigation items for the `root` menu:

```tsx
const navigationItems = runtime.getNavigationItems();
```

To retrieve the navigation items for a **specific** navigation menu, provide a `menuId`:

```tsx
const navigationItems = runtime.getNavigationItems("my-custom-layout");
```

### Use the logger

```ts
// Write a debug log entry.
// If the runtime has been instanciated with multiple logger instances, every logger instance will be invoked.
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
// If the service isn't registered, an exception will be thrown.
const service = runtime.getService(TelemetryService.name) as TelemetryService;
```

[!ref Learn more about services](../services/service.md)

### Retrieve a plugin

```ts
// If the plugin isn't registered, an exception will be thrown.
const plugin = runtime.getPlugin(MswPlugin.name) as MswPlugin;
```

[!ref Learn more about plugins](../plugins/plugin.md)

### Retrieve the current session

```ts
// If no sessionAccessor has been provided, an Error instance will be thrown.
const session = runtime.getSession() as AppSession;
```
