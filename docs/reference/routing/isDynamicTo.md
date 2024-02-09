---
order: -300
toc:
    depth: 2-3
---

# isDynamicTo

Indicate whether or not a navigation item `to` property is a function returning a route path.

## Reference

```ts
const isDynamic = isDynamicTo(to)
```

### Parameters

- `to`: A route path or a function returning a route path.

### Returns

A boolean value indicating whether or not the value is a function.

## Usage

```ts !#6
import { isDynamicTo, type NavigationLinkRenderProps } from "@squide/firefly";

function renderLinkItem({ label, to }: NavigationLinkRenderProps, index: number, level: number) {
    return (
        <li key={`${level}-${index}`}>
            <Link to={isDynamicTo(to) ? to() : to}>
                {label}
            </Link>
        </li>
    );
}
```
