---
order: 900
---

# Add a public page

A route can have one of two visibility values: `"public"` or `"protected"`. However, these visibility values do not determine whether a route is accessible to everyone or restricted to authenticated users. That protection is typically enforced by an [authentication boundary](./add-authentication.md#add-an-authentication-boundary).

In a Squide application, if both the [usePublicDataQueries](../reference/tanstack-query/usePublicDataQueries.md) and [useProtectedDataQueries](../reference/tanstack-query/useProtectedDataQueries.md) hooks are defined, the following will occur: if the initially requested route is hinted as `"protected"`, both hooks will execute their respective requests. However, if the requested route is hinted as `"public"`, only the `usePublicDataQueries` hook will execute its requests.

By default, when a route is registered with the [registerRoute](../reference/runtime/runtime-class.md#register-routes) function, the route is considered as `"protected"`. Therefore, if a route and its layout do not rely on the initial protected data of the application, the route should be explicitly declared as `"public"` using the `$visibility` option:

```tsx !#6 src/register.tsx
import type { ModuleRegisterFunction, FireflyRuntime } from "@squide/firefly";
import { Page } from "./Page.tsx";

export const register: ModuleRegisterFunction<FireflyRuntime> = runtime => {
    runtime.registerRoute({
        $visibility: "public",
        path: "/page",
        element: <Page />
    });
}
```
