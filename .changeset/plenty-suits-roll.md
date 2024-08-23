---
"@squide/core": major
"@squide/fakes": major
"@squide/firefly": major
"@squide/firefly-webpack-configs": major
"@squide/i18next": major
"@squide/module-federation": major
"@squide/msw": major
"@squide/react-router": major
"@squide/webpack-configs": major
---

## Firefly v9

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
