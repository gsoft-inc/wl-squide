# registerLocalModules

Register one or many local module(s). During the registration process, the specified registration function will be invoked with a `Runtime` instance and an optional `context` object.

> A local module is a regular module that is part of the **host application build** and is bundled at build time, as opposed to remote module which is loaded at runtime from a remote server. Local modules are particularly valuable when undergoing a **migration** from a monolithic application to a federated application or when **launching a new product** with an evolving business domain.

## Reference

```ts
registerLocalModules(registerFunctions: [], runtime, options?: { context? })
```

### Parameters

- `registerFunctions`: An array of `ModuleRegisterFunction`.
- `runtime`: A `Runtime` instance.
- `options`: An optional object literal of options:
    - `context`: An optional context object that will be pass to the registration function.

### Returns

Nothing

## Usage

```tsx !#11 host/src/bootstrap.tsx
import { registerLocalModules, Runtime } from "@squide/react-router";
import { register } from "@sample/local-module";
import type { AppContext } from "@sample/shared";

const runtime = new Runtime();

const context: AppContext = {
    name: "Test app"
};

registerLocalModules([register], runtime, { context });
```

```tsx !#7-21 local-module/src/register.tsx
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
        }
    ]);
}
```
