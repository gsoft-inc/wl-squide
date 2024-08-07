---
order: 80
toc:
    depth: 2-3
---

# useRenderedNavigationItems

Recursively parse a navigation items structure to transform the items into React Elements.

> The [useNavigationItems](../runtime/useNavigationItems.md) hook returns the navigation items tree structure as is, meaning the consumer has to recursively parse the structure to transform the items into actual React Elements.
>
> As it's a non-trivial process, Squide provides this utility hook.

## Reference

```ts
const elements = useRenderedNavigationItems(navigationItems: [], renderItem: () => {}, renderSection: () => {})
```

### Parameters

- `navigationItems`: An array of `NavigationItem` to render.
- `renderItem`: A function to render a single link from a navigation item
- `renderSection`: A function to render a section from a collection of items.

### Returns

An array of `ReactElement`.

## Usage

### Render nested items

```tsx !#38-40,42-48,52 host/src/RootLayout.tsx
import type { ReactNode } from "react";
import { Link, Outlet } from "react-router-dom";
import { 
    useNavigationItems, 
    useRenderedNavigationItems, 
    isNavigationLink,
    type RenderItemFunction, 
    type RenderSectionFunction, 
    type NavigationLinkRenderProps, 
    type NavigationSectionRenderProps
} from "@squide/react-router";

type RenderLinkItemFunction = (item: NavigationLinkRenderProps, index: number, level: number) => ReactNode;

type RenderSectionItemFunction = (item: NavigationSectionRenderProps, index: number, level: number) => ReactNode;

const renderLinkItem: RenderLinkItemFunction = ({ label, linkProps, additionalProps }, index, level) => {
    return (
        <li key={`${level}-${index}`}>
            <Link {...linkProps} {...additionalProps}>
                {label}
            </Link>
        </li>
    );
};

const renderSectionItem: RenderSectionItemFunction = ({ label, section }, index, level) => {
    return (
        <li key={`${level}-${index}`}>
            {label}
            <div>
                ({section})
            </div>
        </li>
    );
};

const renderItem: RenderItemFunction = (item, index, level) => {
    return isNavigationLink(item) ? renderLinkItem(item, index, level) : renderSectionItem(item, index, level);
};

const renderSection: RenderSectionFunction = (elements, index, level) => {
    return (
        <ul key={`${level}-${index}`}>
            {elements}
        </ul>
    );
};

export function RootLayout() {
    const navigationItems = useNavigationItems();
    const navigationElements = useRenderedNavigationItems(navigationItems, renderItem, renderSection);

    return (
        <>
            <nav>{navigationElements}</nav>
            <Outlet />
        </>
    );
}
```

### Render dynamic segments

The `to` property of a navigation item can include dynamic segments (`/user-profile/:userId`), enabling the rendering of dynamic routes based on contextual values. To resolve a route dynamic segments, use the [resolveRouteSegments](resolveRouteSegments.md) function.

```tsx !#14,18,21,39-45,56,59 host/src/UserProfileLayout.tsx
import type { ReactNode } from "react";
import { Link, Outlet } from "react-router-dom";
import { 
    useNavigationItems, 
    useRenderedNavigationItems,
    isNavigationLink,
    resolveRouteSegments
    type RenderItemFunction, 
    type RenderSectionFunction, 
    type NavigationLinkRenderProps, 
    type NavigationSectionRenderProps
} from "@squide/react-router";

type RenderLinkItemFunction = (item: NavigationLinkRenderProps, index: number, level: number, userId: string) => ReactNode;

type RenderSectionItemFunction = (item: NavigationSectionRenderProps, index: number, level: number) => ReactNode;

const renderLinkItem: RenderLinkItemFunction = ({ label, { to, ...linkProps}, additionalProps }, index, level, userId) => {
    return (
        <li key={`${level}-${index}`}>
            <Link to={resolveRouteSegments(to as string, { userId })} {...linkProps} {...additionalProps}>
                {label}
            </Link>
        </li>
    );
};

const renderSectionItem: RenderSectionItemFunction = ({ label, section }, index, level) => {
    return (
        <li key={`${level}-${index}`}>
            {label}
            <div>
                ({section})
            </div>
        </li>
    );
};

function renderItem(userId: string) {
    const fct: RenderItemFunction = (item, index, level) => {
        return isNavigationLink(item) ? renderLinkItem(item, index, level, userId) : renderSectionItem(item, index, level);
    };

    return fct;
}

const renderSection: RenderSectionFunction = (elements, index, level) => {
    return (
        <ul key={`${level}-${index}`}>
            {elements}
        </ul>
    );
};

export function UserProfileLayout() {
    const { userId } = useParams();

    const navigationItems = useNavigationItems({ menuId: "/user-profile" });
    const navigationElements = useRenderedNavigationItems(navigationItems, renderItem(userId), renderSection);

    return (
        <>
            <nav>{navigationElements}</nav>
            <Outlet />
        </>
    );
}
```

```tsx !#6 remote-module/src/register.tsx
import type { ModuleRegisterFunction, FireflyRuntime } from "@squide/firefly";

export const register: ModuleRegisterFunction<FireflyRuntime> = (runtime) => {
    runtime.registerNavigationItem({
        $label: "User profile",
        to: "/user-profile/:userId"
    }, {
        menuId: "/user-profile"
    });
}
```


