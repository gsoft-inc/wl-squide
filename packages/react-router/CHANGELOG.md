# @squide/react-router

## 6.2.0

### Minor Changes

- [#204](https://github.com/gsoft-inc/wl-squide/pull/204) [`d3f7b9c`](https://github.com/gsoft-inc/wl-squide/commit/d3f7b9c6aa80249cd898916f6315ea27c4526812) Thanks [@patricklafrance](https://github.com/patricklafrance)! - The `registerNavigationItem` function now accepts a `sectionId` option to nest the item under a specific navigation section:

  ```ts
  runtime.registerNavigationItem(
    {
      $id: "link",
      $label: "Link",
      to: "/link",
    },
    {
      sectionId: "some-section",
    }
  );
  ```

### Patch Changes

- Updated dependencies [[`d3f7b9c`](https://github.com/gsoft-inc/wl-squide/commit/d3f7b9c6aa80249cd898916f6315ea27c4526812)]:
  - @squide/core@5.2.0

## 6.1.0

### Minor Changes

- [#195](https://github.com/gsoft-inc/wl-squide/pull/195) [`98e4839`](https://github.com/gsoft-inc/wl-squide/commit/98e48393fda27ebb2974ecc1e2f71b09f4e84953) Thanks [@patricklafrance](https://github.com/patricklafrance)! - Replaced the `ManagedRoutes` placeholder by the `PublicRoutes` and `ProtectedRoutes` placeholder.

  Before:

  ```tsx
  import {
    ManagedRoutes,
    type ModuleRegisterFunction,
    type FireflyRuntime,
  } from "@squide/firefly";
  import { RootLayout } from "./RootLayout.tsx";

  export const registerHost: ModuleRegisterFunction<FireflyRuntime> = (
    runtime
  ) => {
    runtime.registerRoute(
      {
        element: <RootLayout />,
        children: [ManagedRoutes],
      },
      {
        hoist: true,
      }
    );
  };
  ```

  Now:

  ```tsx
  import {
    PublicRoutes,
    ProtectedRoutes,
    type ModuleRegisterFunction,
    type FireflyRuntime,
  } from "@squide/firefly";
  import { RootLayout } from "./RootLayout.tsx";

  export const registerHost: ModuleRegisterFunction<FireflyRuntime> = (
    runtime
  ) => {
    runtime.registerRoute(
      {
        element: <RootLayout />,
        children: [PublicRoutes, ProtectedRoutes],
      },
      {
        hoist: true,
      }
    );
  };
  ```

  Or:

  ```tsx
  import {
    PublicRoutes,
    ProtectedRoutes,
    type ModuleRegisterFunction,
    type FireflyRuntime,
  } from "@squide/firefly";
  import { RootLayout } from "./RootLayout.tsx";

  export const registerHost: ModuleRegisterFunction<FireflyRuntime> = (
    runtime
  ) => {
    runtime.registerRoute(
      {
        element: <RootLayout />,
        children: [
          PublicRoutes,
          {
            element: <AuthenticationBoundary />,
            children: [
              {
                element: <AuthenticatedLayout />,
                children: [ProtectedRoutes],
              },
            ],
          },
        ],
      },
      {
        hoist: true,
      }
    );
  };
  ```

  This release also includes a new `runtime.registerPublicRoute()` function.

### Patch Changes

- Updated dependencies [[`98e4839`](https://github.com/gsoft-inc/wl-squide/commit/98e48393fda27ebb2974ecc1e2f71b09f4e84953)]:
  - @squide/core@5.1.0

## 6.0.1

### Patch Changes

- [#191](https://github.com/gsoft-inc/wl-squide/pull/191) [`2b62c53`](https://github.com/gsoft-inc/wl-squide/commit/2b62c539b0f3123cb47475566181e0b446ea6b40) Thanks [@patricklafrance](https://github.com/patricklafrance)! - Updated packages description.

- Updated dependencies [[`2b62c53`](https://github.com/gsoft-inc/wl-squide/commit/2b62c539b0f3123cb47475566181e0b446ea6b40)]:
  - @squide/core@5.0.1

## 6.0.0

### Major Changes

- [#182](https://github.com/gsoft-inc/wl-squide/pull/182) [`58cf066`](https://github.com/gsoft-inc/wl-squide/commit/58cf066e87e23611510c254cca96016bd2bad08a) Thanks [@patricklafrance](https://github.com/patricklafrance)! - ## Firefly v9

  This major version of @squide/firefly introduces TanStack Query as the official library for fetching the global data of a Squide's application and features a complete rewrite of the AppRouter component, which now uses a state machine to manage the application's bootstrapping flow.

  Prior to v9, Squide applications couldn't use TanStack Query to fetch global data, making it challenging for Workleap's applications to keep their global data in sync with the server state. With v9, applications can now leverage custom wrappers of the useQueries hook to fetch and keep their global data up-to-date with the server state. Additionally, the new deferred registrations update feature allows applications to even keep their conditional navigation items in sync with the server state.

  Finally, with v9, Squide's philosophy has evolved. We used to describe Squide as a shell for federated applications. Now, we refer to Squide as a shell for modular applications. After playing with Squide's local module feature for a while, we discovered that Squide offers significant value even for non-federated applications, which triggered this shift in philosophy.

  > For a full breakdown of the changres and a migration procedure, read the following [documentation](https://gsoft-inc.github.io/wl-squide/guides/migrate-to-firefly-v9/).

  ## Breaking changes

  - The `useAreModulesRegistered` hook has been removed, use the `useIsBootstrapping` hook instead.
  - The `useAreModulesReady` hook has been removed, use the `useIsBootstrapping` hook instead.
  - The `useIsMswStarted` hook has been removed, use the `useIsBootstrapping` hook instead.
  - The `completeModuleRegistrations` function as been removed use the `useDeferredRegistrations` hook instead.
  - The `completeLocalModulesRegistrations` function has been removed use the `useDeferredRegistrations` hook instead.
  - The `completeRemoteModuleRegistrations` function has been removed use the `useDeferredRegistrations` hook instead.
  - The `useSession` hook has been removed, define your own React context instead.
  - The `useIsAuthenticated` hook has been removed, define your own React context instead.
  - The `sessionAccessor` option has been removed from the `FireflyRuntime` options, define your own React context instead.
  - Removed supports for deferred routes.
  - Plugin's constructor now requires a runtime instance argument.
  - Plugins now registers with a factory function.
  - Full rewrite of the `AppRouter` component.

  ## Renamed

  - The `setMswAsStarted` function has been renamed to `setMswIsReady`.

  ## Others

  - The `@squide/firefly` package now takes a peerDependency on `@tanstack/react-query`.
  - The `@squide/firefly` package doesn't takes a peerDependency on `react-error-boundary` anymore.

  ## New hooks and functions

  - A new `useIsBoostrapping` hook is now available.
  - A new `useDeferredRegistrations` hook is now available.
  - A new `usePublicDataQueries` hook is now available.
  - A new `useProtectedDataQueries` hook is now available.
  - A new `isGlobalDataQueriesError` function is now available.

  ## Improvements

  - Deferred registration functions now always receive a `data` argument.
  - Deferred registration functions now receives a new `operation` argument.
  - Navigation items now include a `$canRender` option, enabling modules to control whether a navigation item should be rendered.
  - New `$key` option for navigation items.

  For more details about the changes and a migration procedure, read the following [documentation](https://gsoft-inc.github.io/wl-squide/guides/migrate-to-firefly-v9/).

### Patch Changes

- Updated dependencies [[`58cf066`](https://github.com/gsoft-inc/wl-squide/commit/58cf066e87e23611510c254cca96016bd2bad08a)]:
  - @squide/core@5.0.0

## 5.0.0

### Major Changes

- [#168](https://github.com/gsoft-inc/wl-squide/pull/168) [`89ace29`](https://github.com/gsoft-inc/wl-squide/commit/89ace29b9aeadbbe83cfa71dd137b9f1a115c283) Thanks [@patricklafrance](https://github.com/patricklafrance)! - This release Migrates Squide from Webpack Module Federation to [Module Federation 2.0](https://module-federation.io/guide/start/quick-start.html).

  This release deprecates the following packages:

  - `@squide/webpack-module-federation`, use `@squide/module-federation` instead.
  - `@squide/firefly-configs`, use `@squide/firefly-webpack-configs` instead.

  And introduce a few changes to existing API:

  - The `FireflyRuntime` nows accept a `useMsw` option and expose a new `isMswEnabled` getter:

  ```ts
  // bootstrap.tsx

  import { FireflyRuntime } from "@squide/firefly";

  const runtime = new FireflyRuntime({
    useMsw: true,
  });

  // Use the runtime to determine if MSW handlers should be registered.
  if (runtime.isMswEnabled) {
    // ...
  }
  ```

  - The `registerRemoteModules` function doesn't accept the remotes URL anymore. The remotes URL should be configured in the webpack configuration files.

  Previously:

  ```ts
  // bootstrap.tsx

  import {
    registerRemoteModules,
    type RemoteDefinition,
  } from "@squide/firefly";

  const Remotes: RemoteDefinition = [
    {
      name: "remote1",
      url: "http://localhost:8081",
    },
  ];

  await registerRemoteModules(Remotes, runtime);
  ```

  ```js
  // webpack.dev.js

  import { defineDevHostConfig } from "@squide/firefly-webpack-configs";
  import { swcConfig } from "./swc.dev.js";

  export default defineDevHostConfig(swcConfig, 8080, {
    overlay: false,
  });
  ```

  Now:

  ```ts
  // bootstrap.tsx

  import {
    registerRemoteModules,
    type RemoteDefinition,
  } from "@squide/firefly";

  const Remotes: RemoteDefinition = [
    {
      name: "remote1",
    },
  ];

  await registerRemoteModules(Remotes, runtime);
  ```

  ```js
  // webpack.dev.js

  import { defineDevHostConfig } from "@squide/firefly-webpack-configs";
  import { swcConfig } from "./swc.dev.js";

  /**
   * @typedef {import("@squide/firefly-webpack-configs").RemoteDefinition}[]
   */
  export const Remotes = [
    {
      name: "remote1",
      url: "http://localhost:8081",
    },
  ];

  export default defineDevHostConfig(swcConfig, 8080, Remotes, {
    overlay: false,
  });
  ```

  To migrate:

  1. Replace the `@squide/webpack-module-federation` dependency by `@squide/module-federation`.

  2. Replace the `@squide/firefly-configs` dependency by `@squide/firefly-webpack-configs`.

  3. Move the remotes URL from the `bootstrap.tsx` file to the `webpack.*.js` files.

  4. Integrate the new `useMsw` and `isMswEnabled` props.

### Patch Changes

- Updated dependencies [[`89ace29`](https://github.com/gsoft-inc/wl-squide/commit/89ace29b9aeadbbe83cfa71dd137b9f1a115c283)]:
  - @squide/core@4.0.0

## 4.1.3

### Patch Changes

- [#154](https://github.com/gsoft-inc/wl-squide/pull/154) [`e440515`](https://github.com/gsoft-inc/wl-squide/commit/e4405150a3c364fd4029c345399891614a434176) Thanks [@patricklafrance](https://github.com/patricklafrance)! - Updated packages.

- Updated dependencies [[`e440515`](https://github.com/gsoft-inc/wl-squide/commit/e4405150a3c364fd4029c345399891614a434176)]:
  - @squide/core@3.4.0

## 4.1.2

### Patch Changes

- [#152](https://github.com/gsoft-inc/wl-squide/pull/152) [`d27fe71`](https://github.com/gsoft-inc/wl-squide/commit/d27fe717f899e395c3f01af86aac3e015159d719) Thanks [@patricklafrance](https://github.com/patricklafrance)! - Updated dependency versions.

- Updated dependencies [[`d27fe71`](https://github.com/gsoft-inc/wl-squide/commit/d27fe717f899e395c3f01af86aac3e015159d719)]:
  - @squide/core@3.3.2

## 4.1.1

### Patch Changes

- Updated dependencies [[`d091846`](https://github.com/gsoft-inc/wl-squide/commit/d091846502bed6b783b69ab8eff7ae36d8e25449)]:
  - @squide/core@3.3.1

## 4.1.0

### Minor Changes

- [#148](https://github.com/gsoft-inc/wl-squide/pull/148) [`a448347`](https://github.com/gsoft-inc/wl-squide/commit/a4483478bb8b7ef1f24513244e8c2410bdb86bc1) Thanks [@patricklafrance](https://github.com/patricklafrance)! - Added a `resolveRouteSegments` function.

## 4.0.4

### Patch Changes

- [#144](https://github.com/gsoft-inc/wl-squide/pull/144) [`39d0bbe4`](https://github.com/gsoft-inc/wl-squide/commit/39d0bbe45902d54832e9aa8deb2c1949a2cf3c5f) Thanks [@patricklafrance](https://github.com/patricklafrance)! - Internal cleanup.

- Updated dependencies [[`39d0bbe4`](https://github.com/gsoft-inc/wl-squide/commit/39d0bbe45902d54832e9aa8deb2c1949a2cf3c5f)]:
  - @squide/core@3.3.0

## 4.0.3

### Patch Changes

- [#137](https://github.com/gsoft-inc/wl-squide/pull/137) [`2f5946f9`](https://github.com/gsoft-inc/wl-squide/commit/2f5946f9c51740dc0d207d53085b143d9f1e407c) Thanks [@patricklafrance](https://github.com/patricklafrance)! - Improved the no custom 404 route handling.

## 4.0.2

### Patch Changes

- [#135](https://github.com/gsoft-inc/wl-squide/pull/135) [`8e73083`](https://github.com/gsoft-inc/wl-squide/commit/8e73083bb90a6f23495ac6a8dca0245862ee2c9a) Thanks [@patricklafrance](https://github.com/patricklafrance)! - Internal changes to `useRouteMatch` and `useIsRouteProtected`.

## 4.0.1

### Patch Changes

- [#133](https://github.com/gsoft-inc/wl-squide/pull/133) [`1cda1be`](https://github.com/gsoft-inc/wl-squide/commit/1cda1be30779d1a1d5d2e21eac043baff20c0f7e) Thanks [@patricklafrance](https://github.com/patricklafrance)! - The `useIsRouteMatchProtected` hook now returns `true` when the location match an unregistered route.

- Updated dependencies [[`1cda1be`](https://github.com/gsoft-inc/wl-squide/commit/1cda1be30779d1a1d5d2e21eac043baff20c0f7e)]:
  - @squide/core@3.2.1

## 4.0.0

### Major Changes

- [#131](https://github.com/gsoft-inc/wl-squide/pull/131) [`7caa44b`](https://github.com/gsoft-inc/wl-squide/commit/7caa44ba81a97d0705caf2f56e6536ae285c920d) Thanks [@patricklafrance](https://github.com/patricklafrance)! - - To be consistent with the other API of Squide, the `useNavigationItems` hook now accept an object literal of options rather than an optional `menuId` argument.

  Before:

  ```tsx
  const items = useNavigationItems("my-custom-menu");
  ```

  Now:

  ```tsx
  const items = useNavigationItems({ menuId: "my-custom-menu" });
  ```

### Patch Changes

- Updated dependencies [[`7caa44b`](https://github.com/gsoft-inc/wl-squide/commit/7caa44ba81a97d0705caf2f56e6536ae285c920d)]:
  - @squide/core@3.2.0

## 3.0.2

### Patch Changes

- Updated dependencies [[`4c3b6f1`](https://github.com/gsoft-inc/wl-squide/commit/4c3b6f1929364844dda6c1190fc45c3b037e8df9)]:
  - @squide/core@3.1.1

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
