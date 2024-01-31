---
order: 50
toc:
    depth: 2-3
---

# useNavigationItems

Retrieve the registered navigation items from the `FireflyRuntime` instance.

## Reference

```ts
const navigationItems = useNavigationItems()
```

### Parameters

- `options`: An optional object literal of options:
    - `menuId`: An optional id to retrieve the navigation menu for a specific menu.

### Returns

An array of `NavigationItem`.

## Usage

### Retrieve the items for the root menu

```ts
import { useNavigationItems } from "@squide/firefly";

const items = useNavigationItems();
```

### Retrieve the items for a specific menu

```ts
import { useNavigationItems } from "@squide/firefly";

const items = useNavigationItems({ menuId: "my-custom-menu" });
```
