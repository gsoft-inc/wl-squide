---
toc:
    depth: 2-3
---

# registerRemoteModules

Register one or many remote module(s). During the registration process, the module `register` function will be invoked with a `Runtime` instance and an optional `context` object.

> A remote module is a module that is not part of the current build but is **loaded at runtime** from a remote server.

## Reference

```ts
registerRemoteModules(remotes: [], runtime, options?: { context? })
```

### Parameters

- `remotes`: An array of `RemoteDefinition` (view the [Remote definition](#remote-definition) section).
- `runtime`: A `Runtime` instance.
- `options`: An optional object literal of options:
    - `context`: An optional context object that will be pass to the registration function.

### Returns

A `Promise` object with an array of `RegistrationError` if any happens during the registration.

- `RegistrationError`:
    - `url`: The URL of the module federation remote that failed to load.
    - `containerName`: The name of the [dynamic container](https://webpack.js.org/concepts/module-federation/#dynamic-remote-containers) that Squide attempted to recover.
    - `moduleName`: The name of the [module](#name) that Squide attempted to recover.
    - `error`: The original error object.

## Usage

```tsx !#11-13,15 host/src/bootstrap.tsx
import { Runtime } from "@squide/react-router";
import { registerRemoteModules, type RemoteDefinition } from "@squide/webpack-module-federation";
import type { AppContext } from "@sample/shared";

const runtime = new Runtime();

const context: AppContext = {
    name: "Test app"
};

const Remotes: RemoteDefinition = [
    { name: "remote1", url: "http://localhost:8081" }
];

registerRemoteModules(Remotes, runtime, { context });
```

```tsx !#5-19 remote-module/src/register.tsx
import type { ModuleRegisterFunction, Runtime } from "@squide/react-router";
import type { AppContext } from "@sample/shared";
import { About } from "./About.tsx";

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

## Remote definition

To ease the configuration of remote modules, make sure that you first import the `RemoteDefinition` type and assign it to your remote definitions array declaration.

```ts !#3
import type { RemoteDefinition } from "@squide/webpack-module-federation";

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

import { defineDevRemoteModuleConfig } from "@squide/webpack-module-federation/defineConfig.js";
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

import { defineDevRemoteModuleConfig } from "@squide/webpack-module-federation/defineConfig.js";
import { swcConfig } from "./swc.dev.js";

export default defineDevRemoteModuleConfig(swcConfig, REMOTE_NAME, 8081, {
    host: "localhost" // (This is the default value)
});
```

In build mode, the `publicPath` is the third argument of the `defineBuildRemoteModuleConfig` function:

```js !#6 remote-module/webpack.build.js
// @ts-check

import { defineBuildRemoteModuleConfig } from "@squide/webpack-module-federation/defineConfig.js";
import { swcConfig } from "./swc.build.js";

export default defineBuildRemoteModuleConfig(swcConfig, REMOTE_NAME, "http://localhost:8081/");
```
