---
"@squide/firefly": patch
---

- To prevent the consumer from always handling the AbortSignal error, a default catch has been added to the `AppRouter` component. The consumer can still handler the AbortSignal error if he needs to.

- When a user makes a direct hit to a deferred route that depends on protected data, the protected data was undefined. The reason was that by default, an unregistered route was considered as a public route. The code has been updated to consider an uregistered route as a protected route. The upside is that deferred routes can now depends on protected data. The downside is that a public deferred route will trigger the loading of the protected data. As we don't expect to have public deferred route at the moment it doesn't seems like an issue.
