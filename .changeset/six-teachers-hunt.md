---
"@squide/react-router": major
---

- To be consistent with the other API of Squide, the `useNavigationItems` hook  now accept an object literal of options rather than an optional `menuId` argument.

Before:

```tsx
const items = useNavigationItems("my-custom-menu");
```

Now:

```tsx
const items = useNavigationItems({ menuId: "my-custom-menu" });
```
