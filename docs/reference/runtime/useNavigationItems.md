---
order: 60
toc:
    depth: 2-3
---

# useNavigationItems

Retrieve the registered navigation items from the `Runtime` instance provided by `RuntimeContext`.

## Reference

```ts
const navigationItems = useNavigationItems()
```

### Parameters

- `menuId`: An optional id to retrieve the navigation menu for a specific menu.

### Returns

An array of `NavigationItem`.

## Usage

### Retrieve the items for the `root` menu

```ts
import { useNavigationItems } from "@squide/react-router";

const items = useNavigationItems();
```

### Retrieve the items for a specific menu

```ts
import { useNavigationItems } from "@squide/react-router";

const items = useNavigationItems("my-custom-menu");
```
