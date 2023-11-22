---
order: 100
toc:
    depth: 2-3
---

# defineDevHostConfig

Creates a webpack [configuration object](https://webpack.js.org/concepts/configuration/) that is adapted for a Squide host application in **development** mode.

!!!info
This function is a wrapper built on top of [@workleap/web-configs](https://www.npmjs.com/package/@workleap/webpack-configs). Make sure to read the [defineDevConfig](https://gsoft-inc.github.io/wl-web-configs/webpack/configure-dev/) documentation first.
!!!

## Reference

```ts
const webpackConfig = defineDevHostConfig(swcConfig: {}, applicationName, port, options?: {})
```

## Parameters

- `swcConfig`: An SWC [configuration object](https://swc.rs/docs/configuration/swcrc).
- `applicationName`: The host application name.
- `port`: The host application port.
- `options`: An optional object literal of options:
    - Accepts most of webpack `definedDevConfig` [predefined options](https://gsoft-inc.github.io/wl-web-configs/webpack/configure-dev/#3-set-predefined-options).
    - `htmlWebpackPluginOptions`: An optional object literal accepting any property of the [HtmlWebpackPlugin](https://github.com/jantimon/html-webpack-plugin#options).
    - `features`: An optional object literal of feature switches to define additional shared dependencies.
        - `i18next`: Whether or not to add `@squide/i18next` as a shared dependency.
    - `sharedDependencies`: An optional object literal of additional (or updated) module federation shared dependencies.
    - `moduleFederationPluginOptions`: An optional object literal of [ModuleFederationPlugin](https://webpack.js.org/plugins/module-federation-plugin/) options.

## Returns

A webpack [configuration object](https://webpack.js.org/concepts/configuration/) tailored for a Squide host application in development mode.

## Default shared dependencies

The `defineDevHostConfig` function will add the following shared dependencies as `singleton` by default:
- [react](https://www.npmjs.com/package/react)
- [react-dom](https://www.npmjs.com/package/react-dom)
- [react-router-dom](https://www.npmjs.com/package/react-router-dom)
- [@squide/core](https://www.npmjs.com/package/@squide/core)
- [@squide/react-router](https://www.npmjs.com/package/@squide/react-router)
- [@squide/webpack-module-federation](https://www.npmjs.com/package/@squide/webpack-module-federation)
- [@squide/msw](https://www.npmjs.com/package/@squide/msw)

For the full shared dependencies configuration, have a look at the [defineConfig.ts](https://github.com/gsoft-inc/wl-squide/blob/main/packages/firefly/src/defineConfig.ts) file on Github.

## Usage

### Define a webpack config

```js !#6 host/webpack.dev.js
// @ts-check

import { defineDevHostConfig } from "@squide/firefly/defineConfig.js";
import { swcConfig } from "./swc.dev.js";

export default defineDevHostConfig(swcConfig, "host", 8080);
```

### Activate optional features

```js !#7-9 host/webpack.dev.js
// @ts-check

import { defineDevHostConfig } from "@squide/firefly/defineConfig.js";
import { swcConfig } from "./swc.dev.js";

export default defineDevHostConfig(swcConfig, "host", 8080, {
    features: {
        i18next: true
    }
});
```

!!!info
Features must be activated on the host application as well as every remote module.
!!!

### Specify additional shared dependencies

```js !#7-11 host/webpack.dev.js
// @ts-check

import { defineDevHostConfig } from "@squide/firefly/defineConfig.js";
import { swcConfig } from "./swc.dev.js";

export default defineDevHostConfig(swcConfig, "host", 8080, {
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

```js !#7-11 host/webpack.dev.js
// @ts-check

import { defineDevHostConfig } from "@squide/firefly/defineConfig.js";
import { swcConfig } from "./swc.dev.js";

export default defineDevHostConfig(swcConfig, "host", 8080, {
    sharedDependencies: {
        "react": {
            requiredVersion: "18.2.0"
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
        requiredVersion: "18.2.0"
    }
}
```

### Override a default shared dependency

```js !#7-11 host/webpack.dev.js
// @ts-check

import { defineDevHostConfig } from "@squide/firefly/defineConfig.js";
import { swcConfig } from "./swc.dev.js";

export default defineDevHostConfig(swcConfig, "host", 8080, {
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

While you could customize the [ModuleFederationPlugin](https://webpack.js.org/plugins/module-federation-plugin/) configuration by providing your own object literal through the `moduleFederationPluginOptions` option, we recommend using the `defineHostModuleFederationPluginOptions(applicationName, options)` function as it will take care of **merging** the custom options with the default plugin options.

```js !#7-9 host/webpack.dev.js
// @ts-check

import { defineDevHostConfig, defineHostModuleFederationPluginOptions } from "@squide/firefly/defineConfig.js";
import { swcConfig } from "./swc.dev.js";

export default defineDevHostConfig(swcConfig, "host", 8080, {
    moduleFederationPluginOptions: defineHostModuleFederationPluginOptions("host", {
        runtime: "my-runtime-name"
    })
});
```

- `applicationName`: The host application name.
- `moduleFederationPluginOptions`: An object literal of [ModuleFederationPlugin](https://webpack.js.org/plugins/module-federation-plugin/) options.



