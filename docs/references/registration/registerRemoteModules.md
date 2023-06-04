# registerRemoteModules

Register one or many remote module(s). During registration, the module `register` function will be called with a `Runtime` instance and an optional `context` object.

> A *remote module* is a module that is not part of the current build but is **loaded at runtime** from a remote server.

## Reference

```ts
registerRemoteModules(remotes: [], runtime, options?: { context? })
```

### Parameters

- `remotes`: An array of `RemoteDefinition` (view the [Remote definition](#remote-definition) section).
- `runtime`: A `Runtime` instance.
- `options`: An optional object literal of options.
    - `context`: An optional context object that will be pass to the registration function.

### Returns

A `Promise` object with an array of [RegistrationError] if any happens during the registration.

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

```tsx !#7-21 remote-module/src/register.tsx
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

## Remote definition

To ease the configuration of remote modules, make sure that you first import the `RemoteDefinition` type and assign it to your remote definitions array declaration.

```ts !#3
import type { RemoteDefinition } from "@squide/webpack-module-federation";

const Remotes: RemoteDefinition = [
    { name: "REMOTE_NAME", url: "REMOTE_URL" }
];
```

### Name

The `name` property of a remote definition **must match** the `name` property defined in the remote module [ModuleFederationPlugin](https://webpack.js.org/plugins/module-federation-plugin/) configuration.

If you are using `@squide` [remoteTransformer](/references/webpack/remoteTransformer.md) function to add the `ModuleFederationPlugin` to the remote module Webpack [configuration object](https://webpack.js.org/concepts/configuration/), the remote module `name` is the second argument of the `remoteTransformer` function.

In the following exemple, the remote module `name` is `remote1`.

```ts !#2 host/src/bootstrap.tsx
const Remotes: RemoteDefinition = [
    { name: "remote1", url: "REMOTE_URL" }
];
```

```js !#7 remote-module/src/webpack.config.js
import { remoteTransformer } from "@squide/webpack-module-federation/configTransformer.js";

const webpackConfig = { ... };

const federatedConfig = remoteTransformer(
    webpackConfig, 
    "remote1"
);

export default federatedConfig;
```

[!ref View the `remoteTransformer` function](/references/webpack/remoteTransformer.md)

### Url

The `url` property of a remote definition **must match** the [publicPath](https://webpack.js.org/guides/public-path/) of the remote module Webpack [configuration object](https://webpack.js.org/concepts/configuration/).

In the following exemple, the remote module `publicPath` is `http://localhost:8081`.

```ts !#2 host/src/bootstrap.tsx
const Remotes: RemoteDefinition = [
    { name: "REMOTE_NAME", url: "http://localhost:8081" }
];
```

```js !#3 remote-module/webpack.config.js
const webpackConfig = {
    output: {
        publicPath: "http://localhost:8081"
    }
};

const federatedConfig = remoteTransformer(
    webpackConfig, 
    "REMOTE_NAME"
);
```
