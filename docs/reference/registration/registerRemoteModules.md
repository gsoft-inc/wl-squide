---
toc:
    depth: 2-3
order: 90
---

# registerRemoteModules

Register one or many remote module(s). During the registration process, the module `register` function will be invoked with a `FireflyRuntime` instance and an optional `context` object. To **defer the registration** of specific routes or navigation items, a registration function can return an anonymous function.

> A remote module is a module that is not part of the current build but is **loaded at runtime** from a remote server.

## Reference

```ts
registerRemoteModules(remotes: [], runtime, options?: { context? })
```

### Parameters

- `remotes`: An array of `RemoteDefinition` (view the [Remote definition](#remote-definition) section).
- `runtime`: A `FireflyRuntime` instance.
- `options`: An optional object literal of options:
    - `context`: An optional context object that will be pass to the registration function.

### Returns

A `Promise` object with an array of `RemoteModuleRegistrationError` if any error happens during the registration.

- `RemoteModuleRegistrationError`:
    - `url`: The URL of the module federation remote that failed to load.
    - `containerName`: The name of the [dynamic container](https://webpack.js.org/concepts/module-federation/#dynamic-remote-containers) that Squide attempted to recover.
    - `moduleName`: The name of the [module](#name) that Squide attempted to recover.
    - `error`: The original error object.

## Usage

### Register a remote module

```tsx !#10-12,14 host/src/bootstrap.tsx
import { FireflyRuntime, registerRemoteModules, type RemoteDefinition } from "@squide/firefly";
import type { AppContext } from "@sample/shared";

const runtime = new FireflyRuntime();

const context: AppContext = {
    name: "Test app"
};

const Remotes: RemoteDefinition = [
    { name: "remote1", url: "http://localhost:8081" }
];

await registerRemoteModules(Remotes, runtime, { context });
```

```tsx !#5-15 remote-module/src/register.tsx
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

To defer a registration to the second phase, a module registration function can **return an anonymous function**. Once the modules are registered and the [completeRemoteModuleRegistrations](./completeRemoteModuleRegistrations.md) function is called, the deferred registration functions will be executed.

```tsx !#18,21 host/src/bootstrap.tsx
import { FireflyRuntime, completeRemoteModuleRegistrations, registerRemoteModules, type RemoteDefinition } from "@squide/firefly";
import { fetchFeatureFlags, type AppContext } from "@sample/shared";

const runtime = new FireflyRuntime();

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

// Complete the module registrations with the feature flags data.
await completeRemoteModuleRegistrations(runtime, { featureFlags });
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

[!ref completeRemoteModuleRegistrations](./completeRemoteModuleRegistrations.md)

### Handle the registration errors

```tsx !#14-16 host/src/bootstrap.tsx
import { FireflyRuntime, registerRemoteModules, type RemoteDefinition } from "@squide/firefly";
import type { AppContext } from "@sample/shared";

const runtime = new FireflyRuntime();

const context: AppContext = {
    name: "Test app"
};

const Remotes: RemoteDefinition = [
    { name: "remote1", url: "http://localhost:8081" }
];

(await registerRemoteModules(Remotes, runtime, { context })).forEach(x => {
    console.log(x);
});
```

## Remote definition

To ease the configuration of remote modules, make sure that you first import the `RemoteDefinition` type and assign it to your remote definitions array declaration.

```ts !#3 host/src/bootstrap.tsx
import type { RemoteDefinition } from "@squide/firefly";

const Remotes: RemoteDefinition = [
    { name: "REMOTE_NAME", url: "REMOTE_URL" }
];
```

### `name`

The `name` property of a remote definition **must match** the `name` property defined in the remote module [ModuleFederationPlugin](https://webpack.js.org/plugins/module-federation-plugin/) configuration.

If you are relying on either the Squide [defineDevRemoteModuleConfig](../webpack//defineDevRemoteModuleConfig.md) or [defineBuildRemoteModuleConfig](../webpack/defineBuildRemoteModuleConfig.md) function to add the `ModuleFederationPlugin` to the remote module webpack [configuration object](https://webpack.js.org/concepts/configuration/), then the remote module `name` is the second argument of the function.

In the following exemple, the remote module `name` is `remote1`.

```ts !#2 host/src/bootstrap.tsx
const Remotes: RemoteDefinition = [
    { name: "remote1", url: `http://localhost:${PORT}` }
];
```

```js !#6 remote-module/src/webpack.dev.js
// @ts-check

import { defineDevRemoteModuleConfig } from "@squide/firefly/defineConfig.js";
import { swcConfig } from "./swc.dev.js";

export default defineDevRemoteModuleConfig(swcConfig, "remote1", PORT);
```

### `url`

The `url` property of a remote definition **must match** the [publicPath](https://webpack.js.org/guides/public-path/) of the remote module webpack [configuration object](https://webpack.js.org/concepts/configuration/).

In the following exemple, the remote module `publicPath` is `http://localhost:8081`.

```ts !#2 host/src/bootstrap.tsx
const Remotes: RemoteDefinition = [
    { name: "REMOTE_NAME", url: "http://localhost:8081" }
];
```

In development mode, the `publicPath` is built from the provided `host` and `port` values. Therefore, if the port value is `8081`, then the generated `publicPath` would be `http://localhost:8081/`:

```js !#6-8 remote-module/webpack.dev.js
// @ts-check

import { defineDevRemoteModuleConfig } from "@squide/firefly/defineConfig.js";
import { swcConfig } from "./swc.dev.js";

export default defineDevRemoteModuleConfig(swcConfig, REMOTE_NAME, 8081, {
    host: "localhost" // (This is the default value)
});
```

In build mode, the `publicPath` is the third argument of the `defineBuildRemoteModuleConfig` function:

```js !#6 remote-module/webpack.build.js
// @ts-check

import { defineBuildRemoteModuleConfig } from "@squide/firefly/defineConfig.js";
import { swcConfig } from "./swc.build.js";

export default defineBuildRemoteModuleConfig(swcConfig, REMOTE_NAME, "http://localhost:8081/");
```
