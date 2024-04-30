---
toc:
    depth: 2-3
order: 70
---

# completeLocalModuleRegistrations

Completes the registration process for modules that have been registred using [registerLocalModules](./registerLocalModules.md) by executing the registered **deferred registration** functions.

!!!info
This function should only be used by applications that support [deferred registrations](./registerLocalModules.md#defer-the-registration-of-routes-or-navigation-items).
!!!

## Reference

```ts
completeLocalModuleRegistrations(runtime, data?)
```

### Parameters

- `runtime`: A `FireflyRuntime` instance.
- `data`: An optional object with data to forward to the deferred registration functions.

### Returns

A `Promise` object with an array of `LocalModuleRegistrationError` if any error happens during the completion of the local modules registration process.

- `LocalModuleRegistrationError`:
    - `error`: The original error object.
    
## Usage

### Complete local module registrations

```tsx !#11,14 host/src/bootstrap.tsx
import { completeLocalModuleRegistrations, registerLocalModules, FireflyRuntime } from "@squide/firefly";
import { register } from "@sample/local-module";
import { fetchFeatureFlags } from "@sample/shared";

const runtime = new FireflyRuntime();

await registerLocalModules([register], runtime);

// Don't fetch data in the bootstrapping code for a real application. This is done here
// strictly for demonstration purpose.
const featureFlags = await fetchFeatureFlags();

// Complete the local module registrations with the feature flags data.
await completeLocalModuleRegistrations(runtime, { featureFlags });
```

```tsx !#19-32 local-module/src/register.tsx
import type { ModuleRegisterFunction, FireflyRuntime } from "@squide/firefly";
import type { DeferredRegistrationData } from "@sample/shared";
import { AboutPage } from "./AboutPage.tsx";
import { FeatureAPage } from "./FeatureAPage.tsx";

export const register: ModuleRegisterFunction<FireflyRuntime, unknown, DeferredRegistrationData> = async runtime => {
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

### Handle the completion errors

```tsx !#13-15 host/src/bootstrap.tsx
import { completeLocalModuleRegistrations, registerLocalModules, FireflyRuntime } from "@squide/firefly";
import { register } from "@sample/local-module";
import { fetchFeatureFlags } from "@sample/shared";

const runtime = new FireflyRuntime();

await registerLocalModules([register], runtime, { context });

// Don't fetch data in the bootstrapping code for a real application. This is done here
// strictly for demonstration purpose.
const featureFlags = await fetchFeatureFlags();

await (completeLocalModuleRegistrations(runtime, { featureFlags })).forEach(x => {
    console.log(x);
});
```
