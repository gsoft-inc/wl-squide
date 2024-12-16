# @squide/firefly-honeycomb

## 2.0.0

### Major Changes

- [#225](https://github.com/gsoft-inc/wl-squide/pull/225) [`4eb46d6`](https://github.com/gsoft-inc/wl-squide/commit/4eb46d69283804a5809494f7275f9d447022a97d) Thanks [@patricklafrance](https://github.com/patricklafrance)! - Added "@opentelemetry/instrumentation-fetch" and "@opentelemetry/sdk-trace-web" as peerDependencies.

### Patch Changes

- Updated dependencies []:
  - @squide/firefly@9.3.2

## 1.0.2

### Patch Changes

- [#223](https://github.com/gsoft-inc/wl-squide/pull/223) [`8cd47f4`](https://github.com/gsoft-inc/wl-squide/commit/8cd47f4eafe7e9ee83fdeaf8cc4a87b1361c0551) Thanks [@patricklafrance](https://github.com/patricklafrance)! - This package is now a wrapper around `@workleap/honeycomb`.

## 1.0.1

### Patch Changes

- [#221](https://github.com/gsoft-inc/wl-squide/pull/221) [`8411080`](https://github.com/gsoft-inc/wl-squide/commit/8411080dfd0df6d0eafb01888298154fa5e5d925) Thanks [@patricklafrance](https://github.com/patricklafrance)! - Fix deferred registrations.

- Updated dependencies [[`8411080`](https://github.com/gsoft-inc/wl-squide/commit/8411080dfd0df6d0eafb01888298154fa5e5d925)]:
  - @squide/firefly@9.3.1

## 1.0.0

### Major Changes

- [#219](https://github.com/gsoft-inc/wl-squide/pull/219) [`25cb482`](https://github.com/gsoft-inc/wl-squide/commit/25cb482779ee280f3f7109de4607b92dcfeef7f3) Thanks [@patricklafrance](https://github.com/patricklafrance)! - New package instrumentating Squide for [Honeycomb](https://www.honeycomb.io/).

  This packages includes:

  - [registerHoneycombInstrumentation](https://gsoft-inc.github.io/wl-squide/reference/honeycomb/registerhoneycombinstrumentation/)
  - [setGlobalSpanAttributes](https://gsoft-inc.github.io/wl-squide/reference/honeycomb/setglobalspanattributes/)

  A [migration guide](https://gsoft-inc.github.io/wl-squide/upgrading/migrate-to-firefly-v9.3) is available to update a Squide application to v9.3 and use Honeycomb observability.

### Patch Changes

- Updated dependencies [[`25cb482`](https://github.com/gsoft-inc/wl-squide/commit/25cb482779ee280f3f7109de4607b92dcfeef7f3)]:
  - @squide/firefly@9.3.0
