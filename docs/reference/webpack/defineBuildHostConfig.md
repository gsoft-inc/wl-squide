---
order: 80
toc:
    depth: 2-3
---

# defineBuildHostConfig

Creates a webpack [configuration object](https://webpack.js.org/concepts/configuration/) that is adapted for a Squide host application in **build** mode.

!!!info
This function is a wrapper built on top of [@workleap/web-configs](https://www.npmjs.com/package/@workleap/webpack-configs). Make sure to read the [defineBuildConfig](https://gsoft-inc.github.io/wl-web-configs/webpack/configure-build/) documentation first.
!!!

## Reference

```ts
const webpackConfig = defineBuildHostConfig(swcConfig: {}, applicationName, remotes: [], options?: {})
```

## Parameters

- `swcConfig`: An SWC [configuration object](https://swc.rs/docs/configuration/swcrc).
- `applicationName`: The host application name.
- `remotes`: An array of `RemoteDefinition` (view the [Remote definition](#remote-definition) section).
- `options`: An optional object literal of options:
    - Accepts most of webpack `definedBuildConfig` [predefined options](https://gsoft-inc.github.io/wl-web-configs/webpack/configure-build/#3-set-predefined-options).
    - `htmlWebpackPluginOptions`: An optional object literal accepting any property of the [HtmlWebpackPlugin](https://github.com/jantimon/html-webpack-plugin#options).
    - `features`: An optional object literal of feature switches to define additional shared dependencies.
        - `i18next`: Whether or not to add `@squide/i18next` as a shared dependency.
    - `sharedDependencies`: An optional object literal of additional (or updated) module federation shared dependencies.
    - `moduleFederationPluginOptions`: An optional object literal of [ModuleFederationPlugin](https://module-federation.io/configure/index.html) options.

## Returns

A webpack [configuration object](https://webpack.js.org/concepts/configuration/) tailored for a Squide host application in build mode.

## Default shared dependencies

The `defineBuildHostConfig` function will add the following shared dependencies as `singleton` by default:
- [react](https://www.npmjs.com/package/react)
- [react-dom](https://www.npmjs.com/package/react-dom)
- [react-router-dom](https://www.npmjs.com/package/react-router-dom)
- [@squide/core](https://www.npmjs.com/package/@squide/core)
- [@squide/react-router](https://www.npmjs.com/package/@squide/react-router)
- [@squide/module-federation](https://www.npmjs.com/package/@squide/module-federation)
- [@squide/msw](https://www.npmjs.com/package/@squide/msw)

For the full shared dependencies configuration, have a look at the [defineConfig.ts](https://github.com/gsoft-inc/wl-squide/blob/main/packages/firefly/src/defineConfig.ts) file on GitHub.

## Usage

### Define a webpack config

```js !#13 host/webpack.build.js
// @ts-check

import { defineBuildHostConfig } from "@squide/firefly-configs";
import { swcConfig } from "./swc.build.js";

/**
 * @typedef {import("@squide/firefly-configs").RemoteDefinition}[]
 */
const Remotes = [
    { name: "remote1", url: "http://localhost:8081" }
];

export default defineBuildHostConfig(swcConfig, "host", Remotes);
```

### Activate additional features

```js !#14-16 host/webpack.build.js
// @ts-check

import { defineBuildHostConfig } from "@squide/firefly-configs";
import { swcConfig } from "./swc.build.js";

/**
 * @typedef {import("@squide/firefly-configs").RemoteDefinition}[]
 */
const Remotes = [
    { name: "remote1", url: "http://localhost:8081" }
];

export default defineBuildHostConfig(swcConfig, "host", Remotes, {
    features: {
        i18next: true
    }
});
```

!!!info
Features must be activated on the host application as well as every remote module.
!!!

### Specify additional shared dependencies

```js !#14-18 host/webpack.build.js
// @ts-check

import { defineBuildHostConfig } from "@squide/firefly-configs";
import { swcConfig } from "./swc.build.js";

/**
 * @typedef {import("@squide/firefly-configs").RemoteDefinition}[]
 */
const Remotes = [
    { name: "remote1", url: "http://localhost:8081" }
];

export default defineBuildHostConfig(swcConfig, "host", Remotes, {
    sharedDependencies: {
        "@sample/shared": {
            singleton: true
        }
    }
});
```

!!!info
Additional shared dependencies must be configured on the host application as well as every remote module.
!!!

### Extend a default shared dependency

```js !#14-18 host/webpack.build.js
// @ts-check

import { defineBuildHostConfig } from "@squide/firefly-configs";
import { swcConfig } from "./swc.build.js";

/**
 * @typedef {import("@squide/firefly-configs").RemoteDefinition}[]
 */
const Remotes = [
    { name: "remote1", url: "http://localhost:8081" }
];

export default defineBuildHostConfig(swcConfig, "host", Remotes, {
    sharedDependencies: {
        "react": {
            requiredVersion: "18.2.0"
        }
    }
});
```

In the previous code sample, the `react` shared dependency will be **augmented** with the `strictVersion` option. The resulting shared dependency will be:

```js !#5
{
    "react": {
        eager: true,
        singleton: true,
        requiredVersion: "18.2.0"
    }
}
```

### Override a default shared dependency

```js !#14-18 host/webpack.build.js
// @ts-check

import { defineBuildHostConfig } from "@squide/firefly-configs";
import { swcConfig } from "./swc.build.js";

/**
 * @typedef {import("@squide/firefly-configs").RemoteDefinition}[]
 */
const Remotes = [
    { name: "remote1", url: "http://localhost:8081" }
];

export default defineBuildHostConfig(swcConfig, "host", Remotes, {
    sharedDependencies: {
        "react": {
            singleton: false
        }
    }
});
```

In the previous code sample, the `react` shared dependency `singleton` option will be **overrided** by the newly provided value. The resulting shared dependency will be:

```js !#4
{
    "react": {
        eager: true,
        singleton: false
    }
}
```

### Customize module federation configuration

While you could customize the [ModuleFederationPlugin](https://module-federation.io/configure/index.html) configuration by providing your own object literal through the `moduleFederationPluginOptions` option, we recommend using the `defineHostModuleFederationPluginOptions(applicationName, options)` function as it will take care of **merging** the custom options with the default plugin options.

```js !#14-16 host/webpack.build.js
// @ts-check

import { defineBuildHostConfig, defineHostModuleFederationPluginOptions } from "@squide/firefly-configs";
import { swcConfig } from "./swc.build.js";

/**
 * @typedef {import("@squide/firefly-configs").RemoteDefinition}[]
 */
const Remotes = [
    { name: "remote1", url: "http://localhost:8081" }
];

export default defineBuildHostConfig(swcConfig, "host", Remotes, {
    moduleFederationPluginOptions: defineHostModuleFederationPluginOptions("host", {
        runtime: "my-runtime-name"
    })
});
```

- `applicationName`: The host application name.
- `moduleFederationPluginOptions`: An object literal of [ModuleFederationPlugin](https://webpack.js.org/plugins/module-federation-plugin/) options.

## Remote definition

### `name`

The `name` property of a remote definition **must match** the `name` property defined in the remote module [ModuleFederationPlugin](https://module-federation.io/configure/index.html) configuration.

If you are relying on the Squide [defineBuildRemoteModuleConfig](../webpack/defineBuildRemoteModuleConfig.md) function to add the `ModuleFederationPlugin` to the remote module webpack [configuration object](https://module-federation.io/), then the remote module `name` is the second argument of the function.

In the following exemple, the remote module `name` is `remote1`.

```js !#5 host/webpack.build.js
/**
 * @typedef {import("@squide/firefly-configs").RemoteDefinition}[]
 */
const Remotes = [
    { name: "remote1", url: `http://localhost:8081` }
];
```

```js !#6 remote-module/webpack.build.js
// @ts-check

import { defineBuildRemoteModuleConfig } from "@squide/firefly-configs";
import { swcConfig } from "./swc.dev.js";

export default defineBuildRemoteModuleConfig(swcConfig, "remote1");
```

### `url`

The `url` property of a remote definition **must match** the [publicPath](https://webpack.js.org/guides/public-path/) of the remote module webpack [configuration object](https://webpack.js.org/concepts/configuration/).

In the following exemple, the remote module `publicPath` is `http://localhost:8081`.

```ts !#5 host/webpack.build.js
/**
 * @typedef {import("@squide/firefly-configs").RemoteDefinition}[]
 */
const Remotes = [
    { name: "remote1", url: "http://localhost:8081" }
];
```

