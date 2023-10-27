---
"@squide/webpack-module-federation": minor
---

This release introduces new APIs to support deferred routes registration with the ultimate goal of conditionally adding routes based on feature flags.

- Added a `completeRemoteModuleRegistrations` function to complete the second phase of the registration process for local remote modules.
- Added a `completeModuleRegistrations` function to execute `completeLocalModuleRegistrations` and `completeRemoteModuleRegistrations` in a single call.
- Added the `useAreModulesRegistered` hook to re-render the application once all the modules are registered (but not ready).
- Reworked the `useAreModulesReady` hook to be complimentary to the `useAreModulesRegistered` hook when deferred registrations are registered. The hook is backward compatible and includes no breaking changes.
- Added a `features` section to the defineConfig functions options.
