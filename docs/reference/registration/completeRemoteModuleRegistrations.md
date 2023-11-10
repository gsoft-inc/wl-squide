---
toc:
    depth: 2-3
order: 60
---

# completeRemoteModuleRegistrations

Completes the registration process for modules that have been registred using [registerRemoteModules](./registerRemoteModules.md) by executing the registered **deferred registration** functions.

!!!info
This function should only be used by applications that support [deferred registrations](./registerRemoteModules.md#defer-the-registration-of-routes-or-navigation-items).
!!!

## Reference

```ts
completeRemoteModuleRegistrations(runtime, data?)
```

### Parameters

- `runtime`: A `Runtime` instance.
- `data`: An optional object with data to forward to the deferred registration functions.

### Returns

A `Promise` object with an array of `RemoteModuleRegistrationError` if any error happens during the completion of the remote modules registration process.

- `RemoteModuleRegistrationError`:
    - `url`: The URL of the module federation remote that failed to load.
    - `containerName`: The name of the [dynamic container](https://webpack.js.org/concepts/module-federation/#dynamic-remote-containers) that Squide attempted to recover.
    - `moduleName`: The name of the module that Squide attempted to recover.
    - `error`: The original error object.

## Usage

### Complete remote module registrations

```tsx !#18,21 host/src/bootstrap.tsx
import { Runtime, completeRemoteModuleRegistrations, registerRemoteModules, type RemoteDefinition } from "@squide/firefly";
import { fetchFeatureFlags, type AppContext } from "@sample/shared";

const runtime = new Runtime();

const context: AppContext = {
    name: "Test app"
};

const Remotes: RemoteDefinition = [
    { name: "remote1", url: "http://localhost:8081" }
];

await registerRemoteModules(Remotes, runtime, { context });

// Don't fetch data in the bootstrapping code for a real application. This is done here
// strictly for demonstration purpose.
const featureFlags = await fetchFeatureFlags();

// Complete the remote module registrations with the feature flags data.
await completeRemoteModuleRegistrations(runtime, { featureFlags });
```

```tsx !#19-32 remote-module/src/register.tsx
import type { ModuleRegisterFunction, Runtime } from "@squide/firefly";
import type { AppContext, DeferredRegistrationData } from "@sample/shared";
import { AboutPage } from "./AboutPage.tsx";
import { FeatureAPage } from "./FeatureAPage.tsx";

export const register: ModuleRegisterFunction<Runtime, AppContext, DeferredRegistrationData> = async (runtime, context) => {
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

```tsx !#20-22 host/src/bootstrap.tsx
import { Runtime, completeRemoteModuleRegistrations, registerRemoteModules, type RemoteDefinition } from "@squide/firefly";
import { fetchFeatureFlags, type AppContext } from "@sample/shared";

const runtime = new Runtime();

const context: AppContext = {
    name: "Test app"
};

const Remotes: RemoteDefinition = [
    { name: "remote1", url: "http://localhost:8081" }
];

await registerRemoteModules(Remotes, runtime, { context });

// Don't fetch data in the bootstrapping code for a real application. This is done here
// strictly for demonstration purpose.
const featureFlags = await fetchFeatureFlags();

await (completeRemoteModuleRegistrations(runtime, { featureFlags })).forEach(x => {
    console.log(x);
});
```
 
