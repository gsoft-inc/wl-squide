---
"@squide/firefly-webpack-configs": minor
"@squide/module-federation": minor
"@squide/webpack-configs": minor
"@squide/react-router": minor
"@squide/firefly": minor
"@squide/i18next": minor
"@squide/fakes": minor
"@squide/core": minor
"@squide/msw": minor
---

The `registerNavigationItem` function now accepts a `sectionId` option to nest the item under a specific navigation section:

```ts
runtime.registerNavigationItem({
    $id: "link",
    $label: "Link",
    to: "/link"
}, {
    sectionId: "some-section"
});
```
