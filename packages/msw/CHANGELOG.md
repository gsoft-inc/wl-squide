# @squide/msw

## 2.0.8

### Patch Changes

- Updated dependencies [[`7caa44b`](https://github.com/gsoft-inc/wl-squide/commit/7caa44ba81a97d0705caf2f56e6536ae285c920d)]:
  - @squide/core@3.2.0

## 2.0.7

### Patch Changes

- [#128](https://github.com/gsoft-inc/wl-squide/pull/128) [`4c3b6f1`](https://github.com/gsoft-inc/wl-squide/commit/4c3b6f1929364844dda6c1190fc45c3b037e8df9) Thanks [@patricklafrance](https://github.com/patricklafrance)! - Internally changed the usage of `setInterval` for `useSyncExternalStore`.

- Updated dependencies [[`4c3b6f1`](https://github.com/gsoft-inc/wl-squide/commit/4c3b6f1929364844dda6c1190fc45c3b037e8df9)]:
  - @squide/core@3.1.1

## 2.0.6

### Patch Changes

- [#122](https://github.com/gsoft-inc/wl-squide/pull/122) [`cda7873`](https://github.com/gsoft-inc/wl-squide/commit/cda7873dcffbf424a625cf40c56a12eacbb2632e) Thanks [@patricklafrance](https://github.com/patricklafrance)! - Internal minor changes

## 2.0.5

### Patch Changes

- [#115](https://github.com/gsoft-inc/wl-squide/pull/115) [`568255a`](https://github.com/gsoft-inc/wl-squide/commit/568255a50a519e7d19c8c2b03909559686cd24c4) Thanks [@patricklafrance](https://github.com/patricklafrance)! - - Request handlers registeration are now printed to the debug logs.

- Updated dependencies [[`568255a`](https://github.com/gsoft-inc/wl-squide/commit/568255a50a519e7d19c8c2b03909559686cd24c4)]:
  - @squide/core@3.1.0

## 2.0.4

### Patch Changes

- Updated dependencies [[`a9dda1c`](https://github.com/gsoft-inc/wl-squide/commit/a9dda1c3b010f616556fc3313c1934e20a26bc11)]:
  - @squide/core@3.0.0

## 2.0.3

### Patch Changes

- [#108](https://github.com/gsoft-inc/wl-squide/pull/108) [`58097a2`](https://github.com/gsoft-inc/wl-squide/commit/58097a2fbaa7e5942cbe6f9b765fe471d52758d8) Thanks [@patricklafrance](https://github.com/patricklafrance)! - Updated types in the function signatures for MSW 2.0

## 2.0.2

### Patch Changes

- [#103](https://github.com/gsoft-inc/wl-squide/pull/103) [`b72fca3`](https://github.com/gsoft-inc/wl-squide/commit/b72fca38385ddacbcd80376c9afd0c9485658d90) Thanks [@patricklafrance](https://github.com/patricklafrance)! - The `msw` dependency is now an optional `peerDependency`.

- Updated dependencies [[`b72fca3`](https://github.com/gsoft-inc/wl-squide/commit/b72fca38385ddacbcd80376c9afd0c9485658d90)]:
  - @squide/core@2.2.0

## 2.0.1

### Patch Changes

- Updated dependencies [[`1e77dca`](https://github.com/gsoft-inc/wl-squide/commit/1e77dcaf26660e42f2d5054b3fa1cd018c2ec009)]:
  - @squide/core@2.1.0

## 2.0.0

### Major Changes

- [#93](https://github.com/gsoft-inc/wl-squide/pull/93) [`d66a196`](https://github.com/gsoft-inc/wl-squide/commit/d66a196db9346803e1c996ef64089eda9aeff180) Thanks [@patricklafrance](https://github.com/patricklafrance)! - This is a new package to help with [Mock Service Worker](https://mswjs.io/) in a federated application.

  It helps to register their request handlers:

  **In module:**

  ```ts
  const mswPlugin = getMswPlugin(runtime);

  mswPlugin.registerRequestHandlers(requestHandlers);
  ```

  **In the host app:**

  ```ts
  const startMsw = (await import("../mocks/browser.ts")).startMsw;

  startMsw(mswPlugin.requestHandlers);
  setMswAsStarted();
  ```

  And offer an utility to wait for MSW to be started before rendering the app:

  ```ts
  const isMswStarted = useIsMswStarted(process.env.USE_MSW);
  ```

### Patch Changes

- Updated dependencies [[`d66a196`](https://github.com/gsoft-inc/wl-squide/commit/d66a196db9346803e1c996ef64089eda9aeff180)]:
  - @squide/core@2.0.0
