---
toc:
    depth: 2-3
order: 80
---

# completeModuleRegistrations

Completes the registration process for modules that have been registred using [registerLocalModules](./registerLocalModules.md) and [registerRemoteModules](./registerRemoteModules.md) by executing the registered **deferred registration** functions.

!!!info
This function should only be used by applications that support [deferred registrations](./registerLocalModules.md#defer-the-registration-of-routes-or-navigation-items).
!!!

## Reference

```ts
completeModuleRegistrations(runtime, data?)
```

### Parameters

- `runtime`: A `FireflyRuntime` instance.
- `data`: An optional object with data to forward to the deferred registration functions.

### Returns

- A `Promise` object with the following properties:
    - `localModuleErrors`: An array of [LocalModuleRegistrationError](./completeLocalModuleRegistrations.md#returns) if any error happens during the completion of the local modules registration process.
    - `remoteModuleErrors`: An array of [RemoteModuleRegistrationError](./completeRemoteModuleRegistrations.md#returns) if any error happens during the completion of the remote modules registration process.

## Usage

### Complete module registrations

```tsx !#15-16,23 host/src/bootstrap.tsx
import { registerLocalModules, FireflyRuntime, completeModuleRegistrations, registerRemoteModules, type RemoteDefinition } from "@squide/firefly";
import { register } from "@sample/local-module";
import { fetchFeatureFlags, type AppContext } from "@sample/shared";

const runtime = new FireflyRuntime();

const context: AppContext = {
    name: "Test app"
};

const Remotes: RemoteDefinition = [
    { name: "remote1" }
];

await registerLocalModules([register], runtime, { context });
await registerRemoteModules(Remotes, runtime, { context });

// Don't fetch data in the bootstrapping code for a real application. This is done here
// strictly for demonstration purpose.
const featureFlags = await fetchFeatureFlags();

// Complete the local module and remote module registrations with the feature flags data.
await completeModuleRegistrations(runtime, { featureFlags });
```

```tsx !#19-32 remote-module/src/register.tsx
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

### Handle the completion errors

```tsx !#22-30 host/src/bootstrap.tsx
import { registerLocalModules, FireflyRuntime, completeModuleRegistrations, registerRemoteModules, type RemoteDefinition } from "@squide/firefly";
import { register } from "@sample/local-module";
import { fetchFeatureFlags, type AppContext } from "@sample/shared";

const runtime = new FireflyRuntime();

const context: AppContext = {
    name: "Test app"
};

const Remotes: RemoteDefinition = [
    { name: "remote1" }
];

await registerLocalModules([register], runtime, { context });
await registerRemoteModules(Remotes, runtime, { context });

// Don't fetch data in the bootstrapping code for a real application. This is done here
// strictly for demonstration purpose.
const featureFlags = await fetchFeatureFlags();

const errors = await completeModuleRegistrations(runtime, { featureFlags });

errors.localModuleErrors.forEach(x => {
    console.log(x);
});

errors.remoteModuleErrors.forEach(x => {
    console.log(x);
});
```
