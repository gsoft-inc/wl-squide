---
"@squide/react-router": minor
"@squide/firefly": minor
"@squide/core": minor
---

Replaced the `ManagedRoutes` placeholder by the `PublicRoutes` and `ProtectedRoutes` placeholder.

Before:

```tsx
import { ManagedRoutes, type ModuleRegisterFunction, type FireflyRuntime } from "@squide/firefly";
import { RootLayout } from "./RootLayout.tsx";

export const registerHost: ModuleRegisterFunction<FireflyRuntime> = runtime => {
    runtime.registerRoute({
        element: <RootLayout />,
        children: [
            ManagedRoutes
        ]
    }, {
        hoist: true
    });
};
```

Now:

```tsx
import { PublicRoutes, ProtectedRoutes, type ModuleRegisterFunction, type FireflyRuntime } from "@squide/firefly";
import { RootLayout } from "./RootLayout.tsx";

export const registerHost: ModuleRegisterFunction<FireflyRuntime> = runtime => {
    runtime.registerRoute({
        element: <RootLayout />,
        children: [
            PublicRoutes,
            ProtectedRoutes
        ]
    }, {
        hoist: true
    });
};
```

Or:

```tsx
import { PublicRoutes, ProtectedRoutes, type ModuleRegisterFunction, type FireflyRuntime } from "@squide/firefly";
import { RootLayout } from "./RootLayout.tsx";

export const registerHost: ModuleRegisterFunction<FireflyRuntime> = runtime => {
    runtime.registerRoute({
        element: <RootLayout />,
        children: [
            PublicRoutes,
            {
                element: <AuthenticationBoundary />,
                children: [
                    {
                        element: <AuthenticatedLayout />,
                        children: [
                            ProtectedRoutes
                        ]
                    }
                ]
            }
        ]
    }, {
        hoist: true
    });
};
```

This release also includes a new `runtime.registerPublicRoute()` function.
