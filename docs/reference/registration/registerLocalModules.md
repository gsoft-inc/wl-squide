---
toc:
    depth: 2-3
---

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

A `Promise` object with an array of `LocalModuleRegistrationError` if any error happens during the registration.

- `LocalModuleRegistrationError`:
    - `error`: The original error object.

## Usage

### Register a local module

```tsx !#11 host/src/bootstrap.tsx
import { registerLocalModules, Runtime } from "@squide/react-router";
import { register } from "@sample/local-module";
import type { AppContext } from "@sample/shared";

const runtime = new Runtime();

const context: AppContext = {
    name: "Test app"
};

await registerLocalModules([register], runtime, { context });
```

```tsx !#5-15 local-module/src/register.tsx
import type { ModuleRegisterFunction, Runtime } from "@squide/react-router";
import type { AppContext } from "@sample/shared";
import { About } from "./About.tsx";

export function register: ModuleRegisterFunction<Runtime, AppContext>(runtime, context) {
    runtime.registerRoute({
        path: "/about",
        element: <About />
    });

    runtime.registerNavigationItem({
        $label: "About",
        to: "/about"
    });
}
```

### Handle the registration errors

```tsx !#11-13 host/src/bootstrap.tsx
import { registerLocalModules, Runtime } from "@squide/react-router";
import { register } from "@sample/local-module";
import type { AppContext } from "@sample/shared";

const runtime = new Runtime();

const context: AppContext = {
    name: "Test app"
};

(await registerLocalModules([register], runtime, { context })).forEach(x => {
    console.log(x);
});
```
