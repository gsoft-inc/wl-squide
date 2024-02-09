---
order: 100
toc:
    depth: 2-3
---

# FireflyRuntime class

A runtime instance give modules access to functionalities such as routing, navigation, request handlers and logging.

## Reference

```ts
const runtime = new FireflyRuntime(options?: { loggers?: [], plugins?: [], sessionAccessor?: () => {} })
```

### Parameters

- `options`: An optional object literal of options:
    - `mode`: An optional mode to optimize Squide for `production`. Values are `"development"` (default) and `"production"`.
    - `loggers`: An optional array of `Logger` instances.
    - `plugins`: An optional array of custom plugin instances.
    - `sessionAccessor`: An optional function returning the current session.

## Usage

### Create a runtime instance

```ts
import { ConsoleLogger, FireflyRuntime } from "@squide/firefly";
import { LocalStorageSessionManager } from "@squide/fakes";
import { type AppSession } from "@sample/shared";

const sessionManager = new LocalStorageSessionManager();

const runtime = new FireflyRuntime({
    loggers: [new ConsoleLogger()],
    sessionAccessor: () => {
        return sessionManager.getSession();
    };
});
```

### Change the runtime mode

```ts
import { FireflyRuntime } from "@squide/firefly";

const runtime = new FireflyRuntime({
    mode: "production"
});
```

### Register routes

```ts
runtime.registerRoute(route, options?: {})
```

- `route`: accept any properties of a React Router [Route](https://reactrouter.com/en/main/components/route) component with the addition of:
    - `$name`: An optional name for the route.
    - `$visibility`: An optional visibility indicator for the route. Accepted values are `"public"` or `"protected"`.
- `options`: An optional object literal of options:
    - `hoist`: An optional boolean value to register the route at the root of the router. The default value is `false`.
    - `parentPath`: An optional path of a parent route to register this new route under.
    - `parentName`: An optional name of a parent route to register this new route under.

```tsx
import { Page } from "./Page.tsx"

// Register a new route from a local or remote module.
runtime.registerRoute({
    path: "/page-1",
    element: <Page />
});
```

### Register an hoisted route

Unlike a regular page, a hoisted page is added at the root of the router, outside of the host application's root layout, root error boundary and even root authentication boundary. This means that a hoisted page has full control over its rendering. To mark a route as hoisted, provide an `hoist` property to the route options.

```tsx !#7
import { Page } from "./Page.tsx";

runtime.registerRoute({
    path: "/page-1",
    element: <Page />
}, {
    hoist: true
});
```

!!!warning
By declaring a page as hoisted, other parts of the application will not be isolated anymore from this page's failures and the page will not be protected anymore by the application authenticated boundary.

- To **avoid breaking the entire application** when an hoisted page encounters unhandled errors, it is highly recommended to declare a React Router's [errorElement](https://reactrouter.com/en/main/route/error-element) property for each hoisted page.
- If the hoisted page requires an authentication, make sure to **wrap the page with an authentication boundary** or to handle the authentication within the page.
!!!

### Register a route with a different layout

```tsx !#9,12,22
import { Page } from "./Page.tsx";
import { RemoteLayout } from "./RemoteLayout.tsx";
import { RemoteErrorBoundary } from "./RemoteErrorBoundary.tsx";

runtime.registerRoute({
    path: "/page-1",
    // Will render the page inside the "RemoteLayout" rather than the "RootLayout".
    // For more information about React Router's nested routes, view https://reactrouter.com/en/main/start/tutorial#nested-routes.
    element: <RemoteLayout />,
    children: [
        {
            errorElement: <RemoteErrorBoundary />,
            children: [
                {
                    index: true,
                    element: <Page />
                }
            ]
        }
    ]
}, {
    hoist: true
});
```

[!ref text="Learn more about overriding the host application layout"](../../guides/override-the-host-layout.md)

### Register a public route

When registering a route, a hint can be provided, indicating if the route is intended to be displayed as a `public` or `protected` route. This is especially useful when dealing with code that conditionally fetch data for protected routes (e.g. a session).

```tsx !#4,8
import { Page } from "./Page.tsx";

runtime.registerRoute({
    $visibility: "public"
    path: "/page-1",
    element: <Page />
}, {
    hoist: true
});
```

A nested route can also have a visibility hint:

```tsx !#10
import { Layout } from "./Layout.tsx";
import { Page } from "./Page.tsx";

runtime.registerRoute({
    $visibility: "public"
    path: "/layout",
    element: <Layout />,
    children: [
        {
            $visibility: "public",
            path: "/page-1",
            element: <Page />,
        }
    ]
}, {
    hoist: true
});
```

If the route is nested under an authentication boundary, don't forget to either mark the route as [hoisted](#register-an-hoisted-route) or to [nest the route](#register-nested-routes-under-an-existing-route) under a public parent.

!!!info
A `$visibility` hint only takes effect if your application is using the [useIsRouteProtected](../routing/useIsRouteProtected.md) hook. When no `$visibility` hint is provided, a route is considered `protected`.
!!!

### Register a named route

The `registerRoute` function accepts a `parentName` property, allowing a route to be [nested under an existing parent route](#register-nested-routes-under-an-existing-route). When searching for the parent route matching the `parentName` property, the `parentName` will be matched against the `$name` property of every route.

> A `$name` property should only be defined for routes that doesn't have a path like an error boundary or an authentication boundary.

```tsx !#4
import { RootErrorBoundary } from "./RootErrorBoundary.tsx";

runtime.registerRoute({
    $name: "error-boundary",
    element: <RootErrorBoundary />
});
```

A nested route can also be named:

```tsx !#8
import { RootErrorBoundary } from "./RootErrorBoundary.tsx";
import { RootLayout } from "./RootLayout.tsx";

runtime.registerRoute({
    $name: "error-boundary",
    element: <RootErrorBoundary />,
    children: [
        $name: "root-layout",
        element: <RootLayout />
    ]
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

[!ref text="Learn more about using nested routes for federated tabs"](../../guides/federated-tabs.md)

!!!info
Likewise any other React Router routes, the `path` property of a page rendered under an existing parent route must be an absolute path. For example, if a parent route `path` is `/layout`, the `path` property of a page rendered under that parent route and responding to the `/page-1` url, should be `/layout/page-1`.
!!!

### Retrieve routes

A federated application routes are accessible from a `FireflyRuntime` instance, but keep in mind that the preferred way to retrieve the routes is with the [useRoutes](./useRoutes) hook.

```tsx
const routes = runtime.routes;
```

### Register navigation items

```ts
runtime.registerNavigationItem(item, options?: {})
```

- `item`: `NavigationSection | NavigationLink`.
- `options`: An optional object literal of options:
    - `menuId`: An optional menu id to associate the item with.

A Squide navigation item can either be a `NavigationLink` or a `NavigationSection`. Both types can be intertwined to create a multi-level menu hierarchy. A `NavigationSection` item is used to setup a new level while a `NavigationLink` define a link.

- `NavigationSection` accept the following properties:
    - `$label`: The section text.
    - `$priority`: An order priority affecting the position of the item in the menu (higher first)
    - `$additionalProps`: Additional properties to be forwarded to the section renderer.
    - `children`: The section content.
- `NavigationLink` accept any properties of a React Router [Link](https://reactrouter.com/en/main/components/link) component with the addition of:
    - `$label`: The link text.
    - `$to`: A route path or a function returning a route path.
    - `$priority`: An order priority affecting the position of the item in the menu (higher first)
    - `$additionalProps`: Additional properties to be forwarded to the link renderer.

```ts
// Register a new navigation item from a local or remote module.
runtime.registerNavigationItem({
    $label: "Page 1",
    $to: "/page-1"
});

// Register a new navigation item with a dynamic route path from a local or remote module.
runtime.registerNavigationItem({
    $label: "Page 2",
    $to: (id: string) => `/page-2/${id}`
});
```

[!ref text="Setup the host application to render navigation items"](../routing/useRenderedNavigationItems.md)

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
    $label: "Section",
    children: [
        {
            label: "Nested Section",
            children: [
                {
                    $label: "Nested Nested Link",
                    $to: "#"
                }
            ]
        },
        {
            $label: "Nested Link",
            $to: "#"
        }
    ]
},
{
    $label: "Link",
    $to: "#"
});
```

### Sort registered navigation items

A `$priority` property can be added to a navigation item to affect it's position in the menu. The sorting algorithm is as follow:

- By default a navigation item have a priority of `0`.
- If no navigation item have a priority, the items are positioned according to their registration order.
- If an item have a priority `> 0`, the item will be positioned before any other items with a lower priority (or without an explicit priority value).
- If an item have a priority `< 0`, the item will be positioned after any other items with a higher priority (or without an explicit priority value).

```ts !#4,12
runtime.registerNavigationItem({
    $label: "About",
    $to: "/about",
    $priority: 10
});

runtime.registerNavigationItem({
    $label: "Home",
    $to: "/home",
    // Because the "Home" navigation item has an higher priority, it will be rendered
    // before the "About" navigation item.
    $priority: 100
});
```

### Use a React element as navigation item label

```tsx !#4-7
import { QuestionMarkIcon } from "@sample/icons";

runtime.registerNavigationItem({
    $label: (
        <QuestionMarkIcon />
        <span>About</span>
    ),
    $to: "/about"
});
```

### Style a navigation item

```ts !#4-6
runtime.registerNavigationItem({
    $label: "About",
    $to: "/about",
    style: {
        backgroundColor: "#000"
    }
});
```

### Open a navigation link in a new tab

```ts !#4
runtime.registerNavigationItem({
    $label: "About",
    $to: "/about",
    target: "_blank"
});
```

### Render additional props on a navigation item

```ts !#4-6
runtime.registerNavigationItem({
    $label: "About",
    $to: "/about",
    $additionalProps: {
        highlight: true
    }
});
```

### Register navigation items for a specific menu

By default, every navigation item registered with the `registerNavigationItem` function is registered as part of the `root` navigation menu. To register a navigation item for a different navigation menu, specify a `menuId` property when registering the items.

```tsx !#5
runtime.registerNavigationItem({
    $label: "Page 1",
    $to: "/layout/page-1"
}, { 
    menuId: "my-custom-layout" 
});
```

### Retrieve navigation items

A federated application navigation items are accessible from a `FireflyRuntime` instance, but keep in mind that the preferred way to retrieve the navigation items is with the [useNavigationItems](./useNavigationItems) hook.

By default, the `getNavigationItems` will return the navigation items for the `root` menu:

```tsx
const navigationItems = runtime.getNavigationItems();
```

To retrieve the navigation items for a **specific** navigation menu, provide a `menuId`:

```tsx
const navigationItems = runtime.getNavigationItems("my-custom-layout");
```

### Register request handlers

The registered handlers must be [Mock Service Worker](https://mswjs.io/docs/concepts/request-handler) request handlers:

```tsx
import { requestHandlers } from "../mocks/handlers.ts";

runtime.registerRequestHandlers(requestHandlers);
```

[!ref text="Learn more about setuping Mock Service Worker"](../../guides/setup-msw.md)

### Retrieve request handlers

```tsx
const requestHandlers = runtime.requestHandlers;
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

### Register a plugin

```ts !#5
import { FireflyRuntime } from "@squide/firefly";
import { MyPlugin } from "@sample/my-plugin";

const runtime = new FireflyRuntime({
    plugins: [new MyPlugin()]
});
```

[!ref Learn more about plugins](../plugins/plugin.md)

### Retrieve a plugin

```ts
import { MyPlugin } from "@sample/my-plugin";

// If the plugin isn't registered, an error is thrown.
const plugin = runtime.getPlugin(MyPlugin.name) as MyPlugin;
```

[!ref Learn more about plugins](../plugins/plugin.md)

### Retrieve the current session

```ts
import type { AppSession } from "@sample/shared";

// If no sessionAccessor has been provided, an error is thrown.
const session = runtime.getSession() as AppSession;
```
