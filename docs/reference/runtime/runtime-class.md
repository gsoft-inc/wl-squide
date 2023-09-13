---
order: 100
---

# Runtime class

A runtime instance give modules access to functionalities such as routing, navigation and logging.

## Reference

```ts
const runtime = new Runtime(options?: { loggers?: [], services?: {}, sessionAccessor?: () => {} })
```

### Parameters

- `options`: An optional object literal of options:
    - `loggers`: An optional array of `Logger` instances.
    - `services`: An optional string-keyed object literal of custom service instances.
    - `sessionAccessor`: An optional function returning the current session.

## Usage

### Create a Runtime instance

```ts
import { ConsoleLogger, Runtime } from "@squide/react-router";
import { LocalStorageSessionManager } from "@squide/fakes";
import { UserService, type UserService, type AppSession } from "@sample/shared";

const sessionManager = new LocalStorageSessionManager();

const runtime = new Runtime({
    loggers: [new ConsoleLogger()],
    services: {
        "user-service": new UserService()
    },
    sessionAccessor: () => {
        return sessionManager.getSession();
    };
});
```

### Register routes

A `@squide` route accept any properties of a React Router [Route](https://reactrouter.com/en/main/components/route) component with the addition of an `hoist` property.

```tsx
import { lazy } from "react";

const Page = lazy(() => import("./Page.tsx"));

// Register a new route from a local or remote module.
runtime.registerRoutes([
    {
        path: "/page-1",
        element: <Page />
    }
]);
```

### Register an hoisted page

Unlike a regular page, a hoisted page is added at the root of the router, outside of the boundaries of the host application's root layout. This means that a hoisted page has full control over its rendering.

```tsx !#9
import { lazy } from "react";

const Page = lazy(() => import("./Page.tsx"));

runtime.registerRoutes([
    {
        path: "/page-1",
        element: <Page />,
        hoist: true
    }
]);
```

[!ref text="Setup the host application to accept hoisted routes"](/reference/routing/useHoistedRoutes.md)

### Register routes under a specific nested layout route

React router [nested routes](https://reactrouter.com/en/main/start/tutorial#nested-routes) enable applications to render nested layouts at various points within the router tree. This is quite helpful for federated applications as it enables composable and decoupled UI.

To fully harness the power of nested routes, the `registerRoutes` function allows a route to be registered **under any** previously registered **nested layout route**, even if that route was registered by another module.

When registering a new route with the `registerRoutes` function, to render the route under a specific nested layout route, specify a `layoutPath` property that matches the nested layout route's `path` property. The only requirement is that the **nested layout route** must have been **registered** to `@squide` **before** the **new child route**.

```tsx !#10
import { lazy } from "react";

const Page = lazy(() => import("./Page.tsx"));

runtime.registerRoutes([
    {
        path: "/layout/page-1",
        element: <Page />
    }
], { layoutPath: "/layout" }); // Register the page under the "/layout" nested layout.
```

!!!info
Likewise any other React Router routes, the `path` property of a page rendered under a nested layout must be an absolute path. For example, if a nested layout `path` is `/layout`, the `path` property of a page rendered under that layout route and responding to the `/page-1` url, should be `/layout/page-1`.
!!!

#### Index routes

Although nested layout routes that serve as indexes (e.g. `{ index: true, element: <Layout /> }`) are not very common, `@squide` still supports this scenario. To register a route **under an index route**, set the `layoutPath` property as the concatenation of the index route's parent path and `/$index$`. 

```tsx !#8,12 host/src/register.tsx
import { lazy } from "react";

const Page = lazy(() => import("./Page.tsx"));
const Layout = lazy(() => import("./Layout.tsx"));

runtime.registerRoutes([
    {
        path: "/page-1",
        element: <Page />,
        children: [
            {
                index: true,
                element: <Layout />
            }
        ]
    }
]);
```

```tsx !#10 remote-module/src/register.tsx
import { lazy } from "react";

const Page = lazy(() => import("./Page.tsx"));

runtime.registerRoutes([
    {
        path: "/page-1/page-2",
        element: <Page />
    }
], { layoutPath: "/page-1/$index$" }); // Using $index$ to match "index: true"
```

### Retrieve routes

A federated application routes are accessible from a `Runtime` instance, but keep in mind that the preferred way to retrieve the routes is with the [useRoutes](./useRoutes) hook.

```tsx
const routes = runtime.routes;
```

### Register navigation items

A `@squide` navigation item can either be a `NavigationLink` or a `NavigationSection`. Both types can be intertwined to create a multi-level menu hierarchy. A `NavigationSection` item is used to setup a new level while a `NavigationLink` define a link.

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
runtime.registerNavigationItems([
    {
        to: "/page-1",
        label: "Page 1"
    }
]);
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
runtime.registerNavigationItems([
    {
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
    }
]);
```

### Sort registered navigation items

A `priority` property can be added to a navigation item to affect it's position in the menu. The sorting algorithm is as follow:

- By default a navigation item have a priority of `0`.
- If no navigation item have a priority, the items are positioned according to their registration order.
- If an item have a priority `> 0`, the item will be positioned before any other items with a lower priority (or without an explicit priority value).
- If an item have a priority `< 0`, the item will be positioned after any other items with a higher priority (or without an explicit priority value).

```ts !#5,12
runtime.registerNavigationItems([
    {
        to: "/about",
        label: "About",
        priority: 10
    },
    {
        to: "/home",
        label: "Home",
        // Because the "Home" navigation item has an higher priority, it will be rendered
        // before the "About" navigation item.
        priority: 100
    }
]);
```

### Use a React Element as navigation item label

```tsx !#6-9
import { QuestionMarkIcon } from "@sample/icons";

runtime.registerNavigationItems([
    {
        to: "/about",
        label: (
            <QuestionMarkIcon />
            <span>About</span>
        )
    }
]);
```

### Style a navigation item

```ts !#5-7
runtime.registerNavigationItems([
    {
        to: "/about",
        label: "About",
        style: {
            backgroundColor: "#000"
        }
    }
]);
```

### Open a navigation link in a new tab

```ts !#5
runtime.registerNavigationItems([
    {
        to: "/about",
        label: "About",
        target: "_blank"
    }
]);
```

### Render additional props on a navigation item

```ts !#5-7
runtime.registerNavigationItems([
    {
        to: "/about",
        label: "About",
        additionalProps: {
            highlight: true
        }
    }
]);
```

### Register navigation items for a specific menu

By default, every navigation item registered with the `registerNavigationItems` function is registered as part of the `root` navigation menu. To register a navigation item for a different navigation menu, specify a `menuId` property when registering the items.

```tsx !#6
runtime.registerNavigationItems([
    {
        to: "/layout/page-1",
        label: "Page 1"
    }
], { menuId: "my-custom-layout" });
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
// If the service isn't registered, undefined will be returned.
const service = runtime.getService("user-service") as UserService;
```

### Retrieve the current session

```ts
// If no sessionAccessor has been provided, an Error instance will be thrown.
const session = runtime.getSession() as AppSession;
```
