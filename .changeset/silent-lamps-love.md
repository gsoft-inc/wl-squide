---
"@squide/core": minor
---

This release introduces new APIs to support deferred routes registration with the ultimate goal of conditionally adding routes based on feature flags.

- Updated the `ModuleRegisterFunction` type to accept a `function` as the return value.
- Added a `completeLocalModuleRegistrations` function to complete the second phase of the registration process for local modules.
