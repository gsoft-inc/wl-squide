---
order: 90
toc:
    depth: 2-3
---

# defineDevRemoteModuleConfig

Creates a webpack [configuration object](https://webpack.js.org/concepts/configuration/) that is adapted for a Squide remote module application in **development** mode.

## Reference

```ts
const webpackConfig = defineDevRemoteModuleConfig(swcConfig: {}, applicationName, port, options?: {})
```

## Parameters

- `swcConfig`: An SWC [configuration object](https://swc.rs/docs/configuration/swcrc).
- `applicationName`: The remote module application name.
- `port`: The remote module application port.
- `options`: An optional object literal of options:
    - Accepts most of webpack `definedDevConfig` [predefined options](https://gsoft-inc.github.io/wl-web-configs/webpack/configure-dev/#3-set-predefined-options).
    - `features`: An optional object literal of feature switches to define additional shared dependencies.
        - `router`: Currently hardcoded to `"react-router"` as it's the only supported router (`@squide/react-router` and `@react-router-dom` are currently considered as default shared dependencies).
        - `msw`: Whether or not to add `@squide/msw` as a shared dependency.
    - `sharedDependencies`: An optional object literal of additional (or updated) module federation shared dependencies.
    - `moduleFederationPluginOptions`: An optional object literal of [ModuleFederationPlugin](https://webpack.js.org/plugins/module-federation-plugin/) options.

## Returns

A webpack [configuration object](https://webpack.js.org/concepts/configuration/) tailored for a Squide remote module application in development mode.

## Conventions

To fulfill Squide remote module requirements, the `defineDevRemoteModuleConfig` function will pre-configure the [ModuleFederationPlugin](https://webpack.js.org/plugins/module-federation-plugin/) with the following `filename` and `exposes` properties.

```js !#6-9
import ModuleFederationPlugin from "webpack/lib/container/ModuleFederationPlugin.js";

export default {
    plugins: [
        ModuleFederationPlugin({
            filename: "/remoteEntry.js",
            exposes: {
                "register.js": "./src/register"
            }
        })
    ]
};
```

!!!info
If the remote module `port` is `8081`, the remote module bundle is available at `http://localhost:8081/remoteEntry.js`.
!!!

## Default shared dependencies

The `defineDevRemoteModuleConfig` function will add the following shared dependencies as `singleton` by default:
- [react](https://www.npmjs.com/package/react)
- [react-dom](https://www.npmjs.com/package/react-dom)
- [react-router-dom](https://www.npmjs.com/package/react-router-dom)
- [@squide/core](https://www.npmjs.com/package/@squide/core)
- [@squide/react-router](https://www.npmjs.com/package/@squide/react-router)
- [@squide/webpack-module-federation](https://www.npmjs.com/package/@squide/webpack-module-federation)

For the full shared dependencies configuration, have a look at the [defineConfig.ts](https://github.com/gsoft-inc/wl-squide/blob/main/packages/webpack-module-federation/src/defineConfig.ts) file on Github.

## Optional shared dependencies

The following shared dependencies can be added through feature switches:
- [`@squide/msw`](https://www.npmjs.com/package/@squide/msw)

## Usage

### Define a webpack config

```js !#6 remote-module/webpack.dev.js
// @ts-check

import { defineDevRemoteModuleConfig } from "@squide/webpack-module-federation/defineConfig.js";
import { swcConfig } from "./swc.dev.js";

export default defineDevRemoteModuleConfig(swcConfig, "remote1", 8080);
```

### Activate additional features

!!!info
Features must be activated on the host application as well as every remote module.
!!!

```js !#7-9 remote-module/webpack.dev.js
// @ts-check

import { defineDevRemoteModuleConfig } from "@squide/webpack-module-federation/defineConfig.js";
import { swcConfig } from "./swc.dev.js";

export default defineDevRemoteModuleConfig(swcConfig, "remote1", 8080, {
    features: {
        msw: true
    }
});
```

### Specify additional shared dependencies

!!!info
Additional shared dependencies must be configured on the host application as well as every remote module.
!!!

```js !#7-11 remote-module/webpack.dev.js
// @ts-check

import { defineDevRemoteModuleConfig } from "@squide/webpack-module-federation/defineConfig.js";
import { swcConfig } from "./swc.dev.js";

export default defineDevRemoteModuleConfig(swcConfig, "remote1", 8080, {
    sharedDependencies: {
        "@sample/shared": {
            singleton: true
        }
    }
});
```

### Extend a default shared dependency

```js !#7-11 remote-module/webpack.dev.js
// @ts-check

import { defineDevRemoteModuleConfig } from "@squide/webpack-module-federation/defineConfig.js";
import { swcConfig } from "./swc.dev.js";

export default defineDevRemoteModuleConfig(swcConfig, "remote1", 8080, {
    sharedDependencies: {
        "react": {
            strictVersion: "18.2.0"
        }
    }
});
```

In the previous example, the `react` shared dependency will be **augmented** with the newly provided `strictVersion` option. The resulting shared dependency will be:

```js !#5
{
    "react": {
        eager: true,
        singleton: true,
        strictVersion: "18.2.0"
    }
}
```

### Override a default shared dependency

```js !#7-11 remote-module/webpack.dev.js
// @ts-check

import { defineDevRemoteModuleConfig } from "@squide/webpack-module-federation/defineConfig.js";
import { swcConfig } from "./swc.dev.js";

export default defineDevRemoteModuleConfig(swcConfig, "remote1", 8080, {
    sharedDependencies: {
        "react": {
            singleton: false
        }
    }
});
```

In the previous example, the `react` shared dependency `singleton` option will be **overrided** by the newly provided value. The resulting shared dependency will be:

```js !#4
{
    "react": {
        eager: true,
        singleton: false
    }
}
```

### Customize module federation configuration

While you could customize the [ModuleFederationPlugin](https://webpack.js.org/plugins/module-federation-plugin/) configuration by providing your own object literal through the `moduleFederationPluginOptions` option, we recommend using the `defineRemoteModuleFederationPluginOptions(applicationName, options)` function as it will take care of **merging** the custom options with the default plugin options.

```js !#7-9 remote-module/webpack.dev.js
// @ts-check

import { defineDevRemoteModuleConfig, defineRemoteModuleFederationPluginOptions } from "@squide/webpack-module-federation/defineConfig.js";
import { swcConfig } from "./swc.dev.js";

export default defineDevRemoteModuleConfig(swcConfig, "remote1", 8080, {
    moduleFederationPluginOptions: defineRemoteModuleFederationPluginOptions("remote1", {
        runtime: "my-runtime-name"
    })
});
```

- `applicationName`: The host application name.
- `moduleFederationPluginOptions`: An object literal of [ModuleFederationPlugin](https://webpack.js.org/plugins/module-federation-plugin/) options.

### Expose an additional module

```js !#7-11 remote-module/webpack.dev.js
// @ts-check

import { defineDevRemoteModuleConfig, defineRemoteModuleFederationPluginOptions } from "@squide/webpack-module-federation/defineConfig.js";
import { swcConfig } from "./swc.dev.js";

export default defineDevRemoteModuleConfig(swcConfig, "remote1", 8080, {
        moduleFederationPluginOptions: defineRemoteModuleFederationPluginOptions("remote1", {
            exposes: {
                "./foo": "./src/bar"
            }
        })
});
```
