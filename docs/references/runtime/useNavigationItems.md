---
order: 60
---

# useNavigationItems

Retrieve the registered navigation items from the `Runtime` instance provided by `RuntimeContext`.

## Reference

```ts
const navigationItems = useNavigationItems()
```

### Parameters

None

### Returns

An array of `NavigationItem`.

## Usage

```ts
import { useNavigationItems } from "@squide/react-router";

const items = useNavigationItems();
```
