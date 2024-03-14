# @squide/webpack-module-federation

## 4.0.0

### Major Changes

- [#158](https://github.com/gsoft-inc/wl-squide/pull/158) [`b8d5ea4`](https://github.com/gsoft-inc/wl-squide/commit/b8d5ea42c23c3291e428c9ff907a7cff2f3211eb) Thanks [@patricklafrance](https://github.com/patricklafrance)! - Cleaned up dependencies.

## 3.0.8

### Patch Changes

- [#154](https://github.com/gsoft-inc/wl-squide/pull/154) [`e440515`](https://github.com/gsoft-inc/wl-squide/commit/e4405150a3c364fd4029c345399891614a434176) Thanks [@patricklafrance](https://github.com/patricklafrance)! - Updated packages.

- Updated dependencies [[`e440515`](https://github.com/gsoft-inc/wl-squide/commit/e4405150a3c364fd4029c345399891614a434176)]:
  - @squide/core@3.4.0

## 3.0.7

### Patch Changes

- [#152](https://github.com/gsoft-inc/wl-squide/pull/152) [`d27fe71`](https://github.com/gsoft-inc/wl-squide/commit/d27fe717f899e395c3f01af86aac3e015159d719) Thanks [@patricklafrance](https://github.com/patricklafrance)! - Updated dependency versions.

- Updated dependencies [[`d27fe71`](https://github.com/gsoft-inc/wl-squide/commit/d27fe717f899e395c3f01af86aac3e015159d719)]:
  - @squide/core@3.3.2

## 3.0.6

### Patch Changes

- Updated dependencies [[`d091846`](https://github.com/gsoft-inc/wl-squide/commit/d091846502bed6b783b69ab8eff7ae36d8e25449)]:
  - @squide/core@3.3.1

## 3.0.5

### Patch Changes

- Updated dependencies [[`39d0bbe4`](https://github.com/gsoft-inc/wl-squide/commit/39d0bbe45902d54832e9aa8deb2c1949a2cf3c5f)]:
  - @squide/core@3.3.0

## 3.0.4

### Patch Changes

- [#133](https://github.com/gsoft-inc/wl-squide/pull/133) [`1cda1be`](https://github.com/gsoft-inc/wl-squide/commit/1cda1be30779d1a1d5d2e21eac043baff20c0f7e) Thanks [@patricklafrance](https://github.com/patricklafrance)! - The completeDeferredRegistrations function data was required instead of optionnal. It has been fixed.

- Updated dependencies [[`1cda1be`](https://github.com/gsoft-inc/wl-squide/commit/1cda1be30779d1a1d5d2e21eac043baff20c0f7e)]:
  - @squide/core@3.2.1

## 3.0.3

### Patch Changes

- Updated dependencies [[`7caa44b`](https://github.com/gsoft-inc/wl-squide/commit/7caa44ba81a97d0705caf2f56e6536ae285c920d)]:
  - @squide/core@3.2.0

## 3.0.2

### Patch Changes

- [#128](https://github.com/gsoft-inc/wl-squide/pull/128) [`4c3b6f1`](https://github.com/gsoft-inc/wl-squide/commit/4c3b6f1929364844dda6c1190fc45c3b037e8df9) Thanks [@patricklafrance](https://github.com/patricklafrance)! - Internally changed the usage of `setInterval` for `useSyncExternalStore`.

- Updated dependencies [[`4c3b6f1`](https://github.com/gsoft-inc/wl-squide/commit/4c3b6f1929364844dda6c1190fc45c3b037e8df9)]:
  - @squide/core@3.1.1

## 3.0.1

### Patch Changes

- Updated dependencies [[`568255a`](https://github.com/gsoft-inc/wl-squide/commit/568255a50a519e7d19c8c2b03909559686cd24c4)]:
  - @squide/core@3.1.0

## 3.0.0

### Major Changes

- [#112](https://github.com/gsoft-inc/wl-squide/pull/112) [`a9dda1c`](https://github.com/gsoft-inc/wl-squide/commit/a9dda1c3b010f616556fc3313c1934e20a26bc11) Thanks [@patricklafrance](https://github.com/patricklafrance)! - - The define functions has been moved to the new `@squide/webpack-configs` package.

### Patch Changes

- Updated dependencies [[`a9dda1c`](https://github.com/gsoft-inc/wl-squide/commit/a9dda1c3b010f616556fc3313c1934e20a26bc11)]:
  - @squide/core@3.0.0

## 2.2.0

### Minor Changes

- [#103](https://github.com/gsoft-inc/wl-squide/pull/103) [`b72fca3`](https://github.com/gsoft-inc/wl-squide/commit/b72fca38385ddacbcd80376c9afd0c9485658d90) Thanks [@patricklafrance](https://github.com/patricklafrance)! - - `defineBuildHostConfig`, `defineDevHostConfig`, `defineBuildRemoteModuleConfig` and `defineDevRemoteModuleConfig` `publicPath` prop is not mandatory anymore. It's default value is now `auto`.
  - `defineBuildHostConfig` and `defineBuildRemoteModuleConfig` set the `HtmlWebpackPlugin` `publicPath` prop to `/` by default.
  - `completeRemoteModuleRegistrations` `data` argument is now required.

### Patch Changes

- Updated dependencies [[`b72fca3`](https://github.com/gsoft-inc/wl-squide/commit/b72fca38385ddacbcd80376c9afd0c9485658d90)]:
  - @squide/core@2.2.0

## 2.1.0

### Minor Changes

- [#101](https://github.com/gsoft-inc/wl-squide/pull/101) [`1e77dca`](https://github.com/gsoft-inc/wl-squide/commit/1e77dcaf26660e42f2d5054b3fa1cd018c2ec009) Thanks [@patricklafrance](https://github.com/patricklafrance)! - This release introduces new APIs to support deferred routes registration with the ultimate goal of conditionally adding routes based on feature flags.

  - Added a `completeRemoteModuleRegistrations` function to complete the second phase of the registration process for local remote modules.
  - Added a `completeModuleRegistrations` function to execute `completeLocalModuleRegistrations` and `completeRemoteModuleRegistrations` in a single call.
  - Added the `useAreModulesRegistered` hook to re-render the application once all the modules are registered (but not ready).
  - Reworked the `useAreModulesReady` hook to be complimentary to the `useAreModulesRegistered` hook when deferred registrations are registered. The hook is backward compatible and includes no breaking changes.
  - Added a `features` section to the defineConfig functions options.

### Patch Changes

- Updated dependencies [[`1e77dca`](https://github.com/gsoft-inc/wl-squide/commit/1e77dcaf26660e42f2d5054b3fa1cd018c2ec009)]:
  - @squide/core@2.1.0

## 2.0.0

### Major Changes

- [#93](https://github.com/gsoft-inc/wl-squide/pull/93) [`d66a196`](https://github.com/gsoft-inc/wl-squide/commit/d66a196db9346803e1c996ef64089eda9aeff180) Thanks [@patricklafrance](https://github.com/patricklafrance)! - - The devserver error overlay is now disabled by default for the remote modules to prevent them from stacking on top of the host application error overlay.
  - Remote modules `register` functions can now be `async`.

### Patch Changes

- Updated dependencies [[`d66a196`](https://github.com/gsoft-inc/wl-squide/commit/d66a196db9346803e1c996ef64089eda9aeff180)]:
  - @squide/core@2.0.0

## 1.0.5

### Patch Changes

- [#83](https://github.com/gsoft-inc/wl-squide/pull/83) [`b29c492`](https://github.com/gsoft-inc/wl-squide/commit/b29c492ab34af978c2c5d34a67234bb9a6949651) Thanks [@patricklafrance](https://github.com/patricklafrance)! - - `eager` was defined for the common shared dependencies of the host application and the modules. This was causing every dependencies to be loaded twice, fixed it.
  - `useAreRemotesReady` was never being ready if there was no local modules configured, fixed it.

## 1.0.4

### Patch Changes

- [#77](https://github.com/gsoft-inc/wl-squide/pull/77) [`5d3295c`](https://github.com/gsoft-inc/wl-squide/commit/5d3295cfdb98ce56b8878dcb1bb58fb3f6fac975) Thanks [@patricklafrance](https://github.com/patricklafrance)! - TBD

- Updated dependencies [[`5d3295c`](https://github.com/gsoft-inc/wl-squide/commit/5d3295cfdb98ce56b8878dcb1bb58fb3f6fac975)]:
  - @squide/core@1.1.1

## 1.0.3

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
