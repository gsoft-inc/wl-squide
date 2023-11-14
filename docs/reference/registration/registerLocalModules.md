---
toc:
    depth: 2-3
order: 100
---

# registerLocalModules

Register one or many local module(s). During the registration process, the specified registration function will be invoked with a `FireflyRuntime` instance and an optional `context` object. To **defer the registration** of specific routes or navigation items, a registration function can return an anonymous function.

> A local module is a regular module that is part of the **host application build** and is bundled at build time, as opposed to remote module which is loaded at runtime from a remote server. Local modules are particularly valuable when undergoing a **migration** from a monolithic application to a federated application or when **launching a new product** with an evolving business domain.

## Reference

```ts
registerLocalModules(registerFunctions: [], runtime, options?: { context? })
```

### Parameters

- `registerFunctions`: An array of `ModuleRegisterFunction`.
- `runtime`: A `FireflyRuntime` instance.
- `options`: An optional object literal of options:
    - `context`: An optional context object that will be pass to the registration function.

### Returns

A `Promise` object with an array of `LocalModuleRegistrationError` if any error happens during the registration.

- `LocalModuleRegistrationError`:
    - `error`: The original error object.

## Usage

### Register a local module

```tsx !#11 host/src/bootstrap.tsx
import { registerLocalModules, FireflyRuntime } from "@squide/firefly";
import { register } from "@sample/local-module";
import type { AppContext } from "@sample/shared";

const runtime = new FireflyRuntime();

const context: AppContext = {
    name: "Test app"
};

await registerLocalModules([register], runtime, { context });
```

```tsx !#5-15 local-module/src/register.tsx
import type { ModuleRegisterFunction, FireflyRuntime } from "@squide/firefly";
import type { AppContext } from "@sample/shared";
import { AboutPage } from "./AboutPage.tsx";

export function register: ModuleRegisterFunction<FireflyRuntime, AppContext>(runtime, context) {
    runtime.registerRoute({
        path: "/about",
        element: <AboutPage />
    });

    runtime.registerNavigationItem({
        $label: "About",
        to: "/about"
    });
}
```

### Defer the registration of routes or navigation items

Sometimes, data must be fetched to determine which routes or navigation items should be registered by a given module. To address this, Squide offers a **two-phase registration mechanism**:

1. The first phase allows modules to register their routes and navigation items that are not dependent on initial data (in addition to their MSW request handlers when fake endpoints are available).

2. The second phase enables modules to register routes and navigation items that are dependent on initial data. Such a use case would be determining whether a route should be registered based on a feature flag. We refer to this second phase as **deferred registrations**.

To defer a registration to the second phase, a module registration function can **return an anonymous function**. Once the modules are registered and the [completeLocalModuleRegistrations](./completeLocalModuleRegistrations.md) function is called, the deferred registration functions will be executed.

```tsx !#15,18 host/src/bootstrap.tsx
import { completeLocalModuleRegistrations, registerLocalModules, FireflyRuntime } from "@squide/firefly";
import { register } from "@sample/local-module";
import { fetchFeatureFlags, type AppContext } from "@sample/shared";

const runtime = new FireflyRuntime();

const context: AppContext = {
    name: "Test app"
};

await registerLocalModules([register], runtime, { context });

// Don't fetch data in the bootstrapping code for a real application. This is done here
// strictly for demonstration purpose.
const featureFlags = await fetchFeatureFlags();

// Complete the module registrations with the feature flags data.
await completeLocalModuleRegistrations(runtime, { featureFlags });
```

```tsx !#19-32 local-module/src/register.tsx
import type { ModuleRegisterFunction, FireflyRuntime } from "@squide/firefly";
import type { AppContext, DeferredRegistrationData } from "@sample/shared";
import { AboutPage } from "./AboutPage.tsx";
import { FeatureAPage } from "./FeatureAPage.tsx";

export const register: ModuleRegisterFunction<FireflyRuntime, AppContext, DeferredRegistrationData> = async (runtime, context) => {
    runtime.registerRoute({
        path: "/about",
        element: <AboutPage />
    });

    runtime.registerNavigationItem({
        $label: "About",
        to: "/about"
    });

    // Once the feature flags has been loaded by the host application, by completing the module registrations process,
    // the deferred registration function will be called with the feature flags data.
    return ({ featureFlags } = {}) => {
        // Only register the "feature-a" route and navigation item if the feature is active.
        if (featureFlags.featureA) {
            runtime.registerRoute({
                path: "/feature-a",
                element: <FeatureAPage />
            });

            runtime.registerNavigationItem({
                $label: "Feature A",
                to: "/feature-a"
            });
        }
    };
}
```

[!ref completeLocalModuleRegistrations](./completeLocalModuleRegistrations.md)

### Handle the registration errors

```tsx !#11-13 host/src/bootstrap.tsx
import { registerLocalModules, FireflyRuntime } from "@squide/firefly";
import { register } from "@sample/local-module";
import type { AppContext } from "@sample/shared";

const runtime = new FireflyRuntime();

const context: AppContext = {
    name: "Test app"
};

(await registerLocalModules([register], runtime, { context })).forEach(x => {
    console.log(x);
});
```
