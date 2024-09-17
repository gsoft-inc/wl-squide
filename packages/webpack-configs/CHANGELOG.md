# @squide/webpack-configs

## 4.1.0

### Minor Changes

- [#202](https://github.com/gsoft-inc/wl-squide/pull/202) [`52d57fc`](https://github.com/gsoft-inc/wl-squide/commit/52d57fcc8fcff7b7f6e84d7621724bad8ed9f2a9) Thanks [@patricklafrance](https://github.com/patricklafrance)! - Webpack config now automatically whether the entry file should be index.ts or index.tsx.

## 4.0.1

### Patch Changes

- [#191](https://github.com/gsoft-inc/wl-squide/pull/191) [`2b62c53`](https://github.com/gsoft-inc/wl-squide/commit/2b62c539b0f3123cb47475566181e0b446ea6b40) Thanks [@patricklafrance](https://github.com/patricklafrance)! - Updated packages description.

## 4.0.0

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

## 3.0.0

### Major Changes

- [#170](https://github.com/gsoft-inc/wl-squide/pull/170) [`119570f`](https://github.com/gsoft-inc/wl-squide/commit/119570f9c93341285a24e8be879d0a468ee2b5db) Thanks [@patricklafrance](https://github.com/patricklafrance)! - The host define function doesn't accept an "applicationName" anymore as it is now hardcoded to "host".

## 2.0.0

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

## 1.2.8

### Patch Changes

- [#165](https://github.com/gsoft-inc/wl-squide/pull/165) [`c9358e5`](https://github.com/gsoft-inc/wl-squide/commit/c9358e5a276e38d877d16a6831251c1932b8497e) Thanks [@bsokol-wl](https://github.com/bsokol-wl)! - update webpack config dependency to remove hashes from chunk filenames

## 1.2.7

### Patch Changes

- [#162](https://github.com/gsoft-inc/wl-squide/pull/162) [`2c0840c`](https://github.com/gsoft-inc/wl-squide/commit/2c0840cb1c2c22e830e4f25f438c240c2d75d27a) Thanks [@patricklafrance](https://github.com/patricklafrance)! - Moved @workleap/webpack-configs as a dependency.

## 1.2.6

### Patch Changes

- [#160](https://github.com/gsoft-inc/wl-squide/pull/160) [`535b62c`](https://github.com/gsoft-inc/wl-squide/commit/535b62c9ce72bf32b69f018d9467a18186d123a8) Thanks [@bsokol-wl](https://github.com/bsokol-wl)! - Add webpack memory caching by default

## 1.2.5

### Patch Changes

- [#154](https://github.com/gsoft-inc/wl-squide/pull/154) [`e440515`](https://github.com/gsoft-inc/wl-squide/commit/e4405150a3c364fd4029c345399891614a434176) Thanks [@patricklafrance](https://github.com/patricklafrance)! - Updated packages.

## 1.2.4

### Patch Changes

- [#152](https://github.com/gsoft-inc/wl-squide/pull/152) [`d27fe71`](https://github.com/gsoft-inc/wl-squide/commit/d27fe717f899e395c3f01af86aac3e015159d719) Thanks [@patricklafrance](https://github.com/patricklafrance)! - Updated dependency versions.

## 1.2.3

### Patch Changes

- [#148](https://github.com/gsoft-inc/wl-squide/pull/148) [`a448347`](https://github.com/gsoft-inc/wl-squide/commit/a4483478bb8b7ef1f24513244e8c2410bdb86bc1) Thanks [@patricklafrance](https://github.com/patricklafrance)! - Removed `@squide/webpack-module-federation` dependency.

## 1.2.2

### Patch Changes

- Updated dependencies []:
  - @squide/webpack-module-federation@3.0.5

## 1.2.1

### Patch Changes

- [#142](https://github.com/gsoft-inc/wl-squide/pull/142) [`524be12b`](https://github.com/gsoft-inc/wl-squide/commit/524be12b26fdde5fe2b5d95ab20e1167a2b812f1) Thanks [@patricklafrance](https://github.com/patricklafrance)! - Removing `i18next-browser-languagedetector` from the shared dependencies as it causing an Error at runtime.

## 1.2.0

### Minor Changes

- [#140](https://github.com/gsoft-inc/wl-squide/pull/140) [`6eaf4ac3`](https://github.com/gsoft-inc/wl-squide/commit/6eaf4ac3f6ac88b62045ce280562a5887589026b) Thanks [@patricklafrance](https://github.com/patricklafrance)! - Added i18next libraries as shared singleton dependencies

## 1.1.4

### Patch Changes

- [`2f077119`](https://github.com/gsoft-inc/wl-squide/commit/2f0771194fd2034602955b8d3f72e1cc43e20e64) Thanks [@patricklafrance](https://github.com/patricklafrance)! - The `defineDevHostConfig` function now enables `fastRefresh`.

## 1.1.3

### Patch Changes

- Updated dependencies [[`1cda1be`](https://github.com/gsoft-inc/wl-squide/commit/1cda1be30779d1a1d5d2e21eac043baff20c0f7e)]:
  - @squide/webpack-module-federation@3.0.4

## 1.1.2

### Patch Changes

- Updated dependencies []:
  - @squide/webpack-module-federation@3.0.3

## 1.1.1

### Patch Changes

- Updated dependencies [[`4c3b6f1`](https://github.com/gsoft-inc/wl-squide/commit/4c3b6f1929364844dda6c1190fc45c3b037e8df9)]:
  - @squide/webpack-module-federation@3.0.2

## 1.1.0

### Minor Changes

- [#115](https://github.com/gsoft-inc/wl-squide/pull/115) [`568255a`](https://github.com/gsoft-inc/wl-squide/commit/568255a50a519e7d19c8c2b03909559686cd24c4) Thanks [@patricklafrance](https://github.com/patricklafrance)! - - A new `features` option is now available with the `defineConfig` functions to add the `@squide/i18next` package to the shared dependencies.

### Patch Changes

- Updated dependencies []:
  - @squide/webpack-module-federation@3.0.1

## 1.0.0

### Major Changes

- [#112](https://github.com/gsoft-inc/wl-squide/pull/112) [`a9dda1c`](https://github.com/gsoft-inc/wl-squide/commit/a9dda1c3b010f616556fc3313c1934e20a26bc11) Thanks [@patricklafrance](https://github.com/patricklafrance)! - This is a new package that includes the webpack configs. Moving the webpack configs to a standalone projects allow `@squide/firefly` to take an optionnal dependency on `webpack`. Thisis useful for local module projects that use the firefly stack but don't want to setup webpack because they do not need to support an isolated development environment.

  This new packages includes:

  - `defineDevHostConfig`
  - `defineBuildHostConfig`
  - `defineDevRemoteModuleConfig`
  - `defineBuildRemoteModuleConfig`

### Patch Changes

- Updated dependencies [[`a9dda1c`](https://github.com/gsoft-inc/wl-squide/commit/a9dda1c3b010f616556fc3313c1934e20a26bc11)]:
  - @squide/webpack-module-federation@3.0.0
