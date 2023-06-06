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

- `options`: An optional object literal of options.
    - `loggers`: An optional array of `Logger` instances.
    - `services`: An optional string-keyed object literal of custom service instances.
    - `sessionAccessor`: An optional function returning the current session.

## Usage

### Create a Runtime instance

```ts
import { ConsoleLogger, Runtime } from "@squide/react-router";
import { SessionManager } from "@squide/fakes";
import { UserService, type UserService, type AppSession } from "@sample/shared";

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

[!ref icon="gear" text="Setup the host application to accept hoisted routes"](/references/routing/useHoistedRoutes.md)

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

[!ref icon="gear" text="Setup the host application to render navigation items"](/references/routing/useRenderedNavigationItems.md)

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
// If the service isn't registered, undefined will be returned.
const service = runtime.getService("user-service") as UserService;
```

### Retrieve the current session

```ts
// If no sessionAccessor has been provided, an Error instance will be thrown.
const session = runtime.getSession() as AppSession;
```
