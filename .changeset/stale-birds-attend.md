---
"@squide/react-router": major
---

### Addition

- Added the `$visibility` field to the `Route` type. This new field indicates that the route doesn't depend on the initial global data (authenticated data) and can be rendered before that data is loaded. The accepted values are `public` and `protected`. By default, every route is `protected`.
- Added the `$name` field to the `Route` type. This new field allow a nested route to be named so other routes can be configured to be nested under this route with the `parentName` option.
- Added a  `ManagedRoutes` placeholder, allowing the application to indicates where managed routes should be rendered. A managed route is a route that is neither hoisted or nested with a `parentPath` or `parentName` option.
- Added the `useRouteMatch` and `useIsRouteMatchProtected` hooks.

### Updated

- `registerRoutes` has been renamed to `registerRoute` and now only accepts a single route by call.
- Moved the `hoist` option from the route definition to an option of `registerRoute`.

Before:

```tsx
registerRoute({
        hoist: true,
	path: "/foo",
	element: <div>Foo</div>
});
```

After:

```tsx
registerRoute({
	path: "/foo",
	element: <div>Foo</div>
}, {
	hoist: true,
});
```

- Route indexes are now created for nested routes registered in a single block. Given the following registration block:

```tsx
runtime.registerRoutes([
    {
        path: "/root",
        element: <div>Hello</div>,
        children: [
            {
                path: "/root/another-level",
                element: <div>You!</div>,
                children: [
                    {
                        path: "/root/another-level/deeply-nested-route",
                        element: <div>Hello from nested!</div>
                    }
                ]
            }
        ]
    }
]);
```

Before the changes, only an index for the `"/root"` route would have been created. This means that consumers could add nested routes under `"/root"` route with the `parentPath` option but couldn't nest routes under the `"/root/another-level"` and `"/root/another-level/deeply-nested-route"` with the `parentPath` option because there was no indexes for these routes.

Now the following is possible:

```tsx
runtime.registerRoutes(
    [
        {
            path: "/foo",
            element: <div>Hello</div>
        }
    ],
    { parentPath: "/root/another-level" }
);

runtime.registerRoutes(
    [
        {
            path: "/foo",
            element: <div>Hello</div>
        }
    ],
    { parentPath: "/root/another-level/deeply-nested-route" }
);
```

### Removed

- The `RootRoute` has been removed, there's now only a single `Route` type.
- The `useHoistedRoutes` has been removed. Hoisting is now supported by default with the `hoist` option of the `registerRoute` function and the `ManagedRoutes` placeholder.
