# useRenderedNavigationItems

Recursively parse a navigation items structure to transform the items into React Elements.

> The `useNavigationItems` hook returns the navigation items tree structure as is, meaning the consumer has to recursively parse the structure to transform the items into actual React Elements.
>
> As it's a non-trivial process, the shell provides this utility hook to help with that.

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

export default function RootLayout() {
    const navigationItems = useNavigationItems();
    const navigationElements = useRenderedNavigationItems(navigationItems, renderItem, renderSection);

    return (
        <>
            <nav>
                {navigationElements}
            </nav>
            <Outlet />
        </>
    );
}
```
