# useRenderedNavigationItems

Recursively parse a navigation items structure to transform the items into actual React elements.

## Reference

```ts
useRenderedNavigationItems(navigationItems: [], renderItem: () => {}, renderSection: () => {})
```

### Parameters

- `navigationItems`: An array of `NavigationItem` to render.
- `renderItem`: A function to render a regular navigation item.
- `renderSection`: A function to render a section navigation item.

### Returns

An array of `ReactElement`.

## Usage

### Render nested navigation items

```tsx host/RootLayout.tsx
import { Link, Outlet } from "react-router-dom";
import { type RenderItemFunction, type RenderSectionFunction, type NavigationLinkRenderProps, type NavigationSectionRenderProps, useNavigationItems, useRenderedNavigationItems, isNavigationLink } from "@squide/react-router";
import type { ReactNode } from "react";

type RenderLinkItemFunction = (item: NavigationLinkRenderProps, index: number, level: number) => ReactNode;

type RenderSectionItemFunction = (item: NavigationSectionRenderProps, index: number, level: number) => ReactNode;

const renderLinkItem: RenderLinkItemFunction = ({ label, linkProps, additionalProps: { highlight, ...additionalProps } }, index, level) => {
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

    const renderedNavigationItems = useRenderedNavigationItems(navigationItems, renderItem, renderSection);

    return (
        <>
            <nav>
                {renderedNavigationItems}
            </nav>
            <Outlet />
        </>
    );
}
```

```tsx remote-module/register.tsx
export const register: ModuleRegisterFunction<Runtime> = runtime => {
    runtime.registerNavigationItems([
        {
            label: "Section",
            children: [
                {
                    to: "#",
                    label: "Nested 1",
                    children: [
                        {
                            to: "#",
                            label: "Nested 1 Nested",
                        }
                    ]
                },
                {
                    to: "#",
                    label: "Nested 2"
                }
            ]
        }
    ]);
}
```

### Sort navigation items by priority

### Render additional props on a navigation item
