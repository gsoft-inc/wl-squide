# registerLocalModule

Register one or many local module(s). During registration, the provided registration function will be called with a `Runtime` instance and an optional `context` object.

> A local module is a module that is bundled at build time rather than at runtime like a *remote module*. Local modules are usually used only when migrating from a monolithic application to a distributed application.

## Reference

```ts
registerLocalModules(registerFunctions: [], runtime, options?: { context? })
```

### Parameters

- `registerFunctions`: An array of `ModuleRegisterFunction`.
- `runtime`: A `Runtime` instance.
- `options`: An optional object literal of options.
    - `context`: An optional context object that will be pass to the registration function.

### Returns

Nothing

## Usage

```tsx !#11 host/bootstrap.tsx
import { registerLocalModules, Runtime } from "@squide/react-router";
import { register } from "@sample/local-module";
import type { AppContext } from "@sample/shared";

const runtime = new Runtime();

const context: AppContext = {
    name: "Test app"
};

registerLocalModules([register], runtime, { context });
```

```tsx !#7-21 @sample/local-module/register.ts
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
