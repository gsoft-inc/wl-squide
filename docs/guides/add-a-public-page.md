---
order: 900
---

# Add a public page

By default, when a route is registered with the [registerRoute](../reference/runtime/runtime-class.md#register-routes) function, the route is considered as "protected". This doesn't imply that the route becomes inacessible to unauthenticated users thought; as this protection is typically granted by an [authentication boundary](./add-authentication.md#add-an-authentication-boundary). What it means is that if the [AppRouter](../reference/routing/appRouter.md) component's [onLoadPublicData](../reference/routing/appRouter.md#load-public-data) and [onLoadProtectedData](../reference/routing/appRouter.md#load-protected-data) handlers are defined, both handlers will be executed when the route is requested (assuming it is the initial request).

Therefore, if a route and its layout do not rely on the initial protected data of the application, the route should be declared as `public` using the `$visibility` option:

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

By doing so, only the `onLoadPublicData` handler will be executed when the public route is requested (assuming it is the initial request).
