---
order: 70
---

# useRoutes

Retrieve the registered routes from the `Runtime` instance provided by `RuntimeContext`.

## Reference

```ts
useRoutes()
```

### Parameters

None

### Returns

An array of `RootRoute`.

## Usage

```ts
import { useRoutes } from "@squide/react-router";

const routes = useRoutes();
```

```tsx !#8-13 remote/register.ts
import { lazy } from "react";
import type { ModuleRegisterFunction, Runtime } from "@squide/react-router";
import type { AppContext } from "@sample/shared";

const About = lazy(() => import("./About.tsx"));

export function register: ModuleRegisterFunction<Runtime, AppContext>(runtime, context) {
    runtime.registerRoutes([
        {
            path: "/about",
            element: <About />
        }
    ]);
    
    runtime.registerNavigationItems([
        {
            to: "/about",
            label: "About"
        },
    ]);
}
```
