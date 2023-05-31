---
order: 60
---

# useNavigationItems

Retrieve the registered navigation items from the `Runtime` instance provided by `RuntimeContext`.

## Reference

```ts
useNavigationItems()
```

### Parameters

None

### Returns

An array of `RootNavigationItem`.

## Usage

```ts
import { useNavigationItems } from "@squide/react-router";

const items = useNavigationItems();
```

```tsx !#8-13 remote/register.ts
import { lazy } from "react";
import type { ModuleRegisterFunction, Runtime } from "@squide/react-router";
import type { AppContext } from "@sample/shared";

const About = lazy(() => import("./About.tsx"));

export function register: ModuleRegisterFunction<Runtime, AppContext>(runtime, context) {
    runtime.registerNavigationItems([
        {
            to: "/about",
            label: "About"
        },
    ]);

    runtime.registerRoutes([
        {
            path: "/about",
            element: <About />
        }
    ]);
}
```
