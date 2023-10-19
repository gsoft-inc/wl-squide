---
"@squide/core": major
---

### Addition

- Added support for plugins to Squide runtime.
- Added a `parentName` option to `registerRoute`.

### Updated

- The `layoutPath` option of `registerRoute` has been renamed to `parentPath`.
- `registerNavigationItems` has been renamed to `registerNavigationItem` and now only accepts a single item by call.
- A navigation item `label`, `additionalProps` and `priority` fields has been renamed to `$label`, `$additionalProps` and `$priority`. This is part of an effort to ensure no future release of [React Router](https://reactrouter.com/en/main) introduced new properties with names that are conflicting with Squide.
- Local modules `register` function can now be `async`. This is useful if you want for example to conditionally to a dynamic `import` to load a dependency such as [msw](https://www.npmjs.com/package/msw).

### Removed

- Removed the Service features at it was confusing and not that helpful. We recommend using React context instead to share services with the modules.
