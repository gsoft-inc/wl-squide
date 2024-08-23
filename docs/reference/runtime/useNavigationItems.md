---
order: 50
toc:
    depth: 2-3
---

# useNavigationItems

Retrieve the registered navigation items from the `FireflyRuntime` instance.

## Reference

```ts
const navigationItems = useNavigationItems(options?: { menuId? })
```

### Parameters

- `options`: An optional object literal of options:
    - `menuId`: An optional id to retrieve the navigation menu for a specific menu.

### Returns

An array of `NavigationLink | NavigationSection`.

#### `NavigationLink`

Accept any properties of a React Router [Link](https://reactrouter.com/en/main/components/link) component with the addition of:
- `$key`: An optional key identifying the link. Usually used as the React element [key](https://legacy.reactjs.org/docs/lists-and-keys.html#keys) property.
- `$label`: The link label. Could either by a `string` or a `ReactNode`.
- `$canRender`: An optional function accepting an object and returning a `boolean` indicating whether or not the link should be rendered.
- `$additionalProps`: An optional object literal of additional props to apply to the link component.

#### `NavigationSection`

- `$key`: An optional key identifying the section. Usually used as the React element [key](https://legacy.reactjs.org/docs/lists-and-keys.html#keys) property.
- `$label`: The section label. Could either by a `string` or a `ReactNode`.
- `$canRender`: An optional function accepting an object and returning a `boolean` indicating whether or not the section should be rendered.
- `$additionalProps`: An optional object literal of additional props to apply to the section component.
- `children`: The section items.

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
