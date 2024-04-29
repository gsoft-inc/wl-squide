---
toc:
    depth: 2-3
order: -100
---

# mergeDeferredRegistrations

Utility function that takes an array of [deferred registration](./registerLocalModules.md#defer-the-registration-of-routes-or-navigation-items) functions and returns a single function wrapping and merging all the provided deferred registration functions.

If the provided array contains `undefined` values, they will safely be ignored.

## Reference

```ts
mergeDeferredRegistrations(candidates: []);
```

### Parameters

- `candidates`: An array of [deferred registration](./registerLocalModules.md#defer-the-registration-of-routes-or-navigation-items) functions, `undefined` values will safely be ignored.

### Returns

A function or `undefined`:

- If multiple deferred registration functions are provided, a single function wrapping and merging all the provided deferred registration functions is returned.
- If a single deferred registration function is provided, the provided function is returned.
- If no deferred registration functions are provided, `undefined` is returned.

## Usage

```tsx shell/src/register.tsx
import { mergeDeferredRegistrations, type ModuleRegisterFunction, type FireflyRuntime } from "@squide/firefly";
import type { AppContext } from "@sample/shared";
import { registerLayouts } from "@sample/layouts";
import { registerAppShell } from "./registerAppShell.tsx";

function registerRoutes(runtime: FireflyRuntime) {
    ...
}

export function register: ModuleRegisterFunction<FireflyRuntime, AppContext>(runtime, context) {
    return mergeDeferredRegistrations([
        await registerLayouts(runtime),
        await registerAppShell(runtime),
        registerRoutes(runtimet)
    ]);
}
```
