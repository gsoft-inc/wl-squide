# @squide/react-router

## 3.0.1

### Patch Changes

- Updated dependencies [[`568255a`](https://github.com/gsoft-inc/wl-squide/commit/568255a50a519e7d19c8c2b03909559686cd24c4)]:
  - @squide/core@3.1.0

## 3.0.0

### Major Changes

- [#112](https://github.com/gsoft-inc/wl-squide/pull/112) [`a9dda1c`](https://github.com/gsoft-inc/wl-squide/commit/a9dda1c3b010f616556fc3313c1934e20a26bc11) Thanks [@patricklafrance](https://github.com/patricklafrance)! - - The `Runtime` class has been renamed to `ReactRouterRuntime`.
  - This package doesn't forward the `@squide/core` package exports anymore.

### Patch Changes

- Updated dependencies [[`a9dda1c`](https://github.com/gsoft-inc/wl-squide/commit/a9dda1c3b010f616556fc3313c1934e20a26bc11)]:
  - @squide/core@3.0.0

## 2.0.2

### Patch Changes

- [#103](https://github.com/gsoft-inc/wl-squide/pull/103) [`b72fca3`](https://github.com/gsoft-inc/wl-squide/commit/b72fca38385ddacbcd80376c9afd0c9485658d90) Thanks [@patricklafrance](https://github.com/patricklafrance)! - - The `completeLocalModuleRegistrations` function `data` argument is now required.
  - Internal cleanup
- Updated dependencies [[`b72fca3`](https://github.com/gsoft-inc/wl-squide/commit/b72fca38385ddacbcd80376c9afd0c9485658d90)]:
  - @squide/core@2.2.0

## 2.0.1

### Patch Changes

- Updated dependencies [[`1e77dca`](https://github.com/gsoft-inc/wl-squide/commit/1e77dcaf26660e42f2d5054b3fa1cd018c2ec009)]:
  - @squide/core@2.1.0

## 2.0.0

### Major Changes

- [#93](https://github.com/gsoft-inc/wl-squide/pull/93) [`d66a196`](https://github.com/gsoft-inc/wl-squide/commit/d66a196db9346803e1c996ef64089eda9aeff180) Thanks [@patricklafrance](https://github.com/patricklafrance)! - ### Addition

  - Added the `$visibility` field to the `Route` type. This new field indicates that the route doesn't depend on the initial global data (authenticated data) and can be rendered before that data is loaded. The accepted values are `public` and `protected`. By default, every route is `protected`.
  - Added the `$name` field to the `Route` type. This new field allow a nested route to be named so other routes can be configured to be nested under this route with the `parentName` option.
  - Added a `ManagedRoutes` placeholder, allowing the application to indicates where managed routes should be rendered. A managed route is a route that is neither hoisted or nested with a `parentPath` or `parentName` option.
  - Added the `useRouteMatch` and `useIsRouteMatchProtected` hooks.

  ### Updated

  - `registerRoutes` has been renamed to `registerRoute` and now only accepts a single route by call.
  - Moved the `hoist` option from the route definition to an option of `registerRoute`.

  Before:

  ```tsx
  registerRoute({
    hoist: true,
    path: "/foo",
    element: <div>Foo</div>,
  });
  ```

  After:

  ```tsx
  registerRoute(
    {
      path: "/foo",
      element: <div>Foo</div>,
    },
    {
      hoist: true,
    }
  );
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
              element: <div>Hello from nested!</div>,
            },
          ],
        },
      ],
    },
  ]);
  ```

  Before the changes, only an index for the `"/root"` route would have been created. This means that consumers could add nested routes under `"/root"` route with the `parentPath` option but couldn't nest routes under the `"/root/another-level"` and `"/root/another-level/deeply-nested-route"` with the `parentPath` option because there was no indexes for these routes.

  Now the following is possible:

  ```tsx
  runtime.registerRoutes(
    [
      {
        path: "/foo",
        element: <div>Hello</div>,
      },
    ],
    { parentPath: "/root/another-level" }
  );

  runtime.registerRoutes(
    [
      {
        path: "/foo",
        element: <div>Hello</div>,
      },
    ],
    { parentPath: "/root/another-level/deeply-nested-route" }
  );
  ```

  ### Removed

  - The `RootRoute` has been removed, there's now only a single `Route` type.
  - The `useHoistedRoutes` has been removed. Hoisting is now supported by default with the `hoist` option of the `registerRoute` function and the `ManagedRoutes` placeholder.

### Patch Changes

- Updated dependencies [[`d66a196`](https://github.com/gsoft-inc/wl-squide/commit/d66a196db9346803e1c996ef64089eda9aeff180)]:
  - @squide/core@2.0.0

## 1.1.1

### Patch Changes

- [#77](https://github.com/gsoft-inc/wl-squide/pull/77) [`5d3295c`](https://github.com/gsoft-inc/wl-squide/commit/5d3295cfdb98ce56b8878dcb1bb58fb3f6fac975) Thanks [@patricklafrance](https://github.com/patricklafrance)! - TBD

- Updated dependencies [[`5d3295c`](https://github.com/gsoft-inc/wl-squide/commit/5d3295cfdb98ce56b8878dcb1bb58fb3f6fac975)]:
  - @squide/core@1.1.1

## 1.1.0

### Minor Changes

- [#73](https://github.com/gsoft-inc/wl-squide/pull/73) [`5407086`](https://github.com/gsoft-inc/wl-squide/commit/5407086a98587901abe341360729f8fe972d8174) Thanks [@patricklafrance](https://github.com/patricklafrance)! - Added a new composable nested layouts feature

### Patch Changes

- Updated dependencies [[`5407086`](https://github.com/gsoft-inc/wl-squide/commit/5407086a98587901abe341360729f8fe972d8174)]:
  - @squide/core@1.1.0

## 1.0.2

### Patch Changes

- [#66](https://github.com/gsoft-inc/wl-squide/pull/66) [`1a419de`](https://github.com/gsoft-inc/wl-squide/commit/1a419de33e22af7af990984068ab864e5be8fd4b) Thanks [@patricklafrance](https://github.com/patricklafrance)! - New release

- Updated dependencies [[`1a419de`](https://github.com/gsoft-inc/wl-squide/commit/1a419de33e22af7af990984068ab864e5be8fd4b)]:
  - @squide/core@1.0.2

## 1.0.1

### Patch Changes

- [#54](https://github.com/gsoft-inc/wl-squide/pull/54) [`1f0e967`](https://github.com/gsoft-inc/wl-squide/commit/1f0e96781513b262122fb8e47e10379caae0b731) Thanks [@ofrogon](https://github.com/ofrogon)! - Migrate project from GitHub organization

- Updated dependencies [[`1f0e967`](https://github.com/gsoft-inc/wl-squide/commit/1f0e96781513b262122fb8e47e10379caae0b731)]:
  - @squide/core@1.0.1

## 1.0.0

### Major Changes

- [#30](https://github.com/gsoft-inc/wl-squide/pull/30) [`edcd948`](https://github.com/gsoft-inc/wl-squide/commit/edcd948fa942a36fa77b05459722e91fa2f80f11) Thanks [@patricklafrance](https://github.com/patricklafrance)! - First stable release of @squide

### Patch Changes

- Updated dependencies [[`edcd948`](https://github.com/gsoft-inc/wl-squide/commit/edcd948fa942a36fa77b05459722e91fa2f80f11)]:
  - @squide/core@1.0.0

## 0.0.1

### Patch Changes

- [#20](https://github.com/gsoft-inc/wl-squide/pull/20) [`1c3e332`](https://github.com/gsoft-inc/wl-squide/commit/1c3e3321ba2f54558f8b10b934d0defa8156ae29) Thanks [@patricklafrance](https://github.com/patricklafrance)! - Testing changeset configuration

- Updated dependencies [[`1c3e332`](https://github.com/gsoft-inc/wl-squide/commit/1c3e3321ba2f54558f8b10b934d0defa8156ae29)]:
  - @squide/core@0.0.1
