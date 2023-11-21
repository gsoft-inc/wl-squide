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
const webpackConfig = defineBuildHostConfig(swcConfig: {}, applicationName, options?: {})
```

## Parameters

- `swcConfig`: An SWC [configuration object](https://swc.rs/docs/configuration/swcrc).
- `applicationName`: The host application name.
- `options`: An optional object literal of options:
    - Accepts most of webpack `definedBuildConfig` [predefined options](https://gsoft-inc.github.io/wl-web-configs/webpack/configure-build/#3-set-predefined-options).
    - `htmlWebpackPluginOptions`: An optional object literal accepting any property of the [HtmlWebpackPlugin](https://github.com/jantimon/html-webpack-plugin#options).
    - `features`: An optional object literal of feature switches to define additional shared dependencies.
        - `i18next`: Whether or not to add `@squide/i18next` as a shared dependency.
    - `sharedDependencies`: An optional object literal of additional (or updated) module federation shared dependencies.
    - `moduleFederationPluginOptions`: An optional object literal of [ModuleFederationPlugin](https://webpack.js.org/plugins/module-federation-plugin/) options.

## Returns

A webpack [configuration object](https://webpack.js.org/concepts/configuration/) tailored for a Squide host application in build mode.

## Default shared dependencies

The `defineBuildHostConfig` function will add the following shared dependencies as `singleton` by default:
- [react](https://www.npmjs.com/package/react)
- [react-dom](https://www.npmjs.com/package/react-dom)
- [react-router-dom](https://www.npmjs.com/package/react-router-dom)
- [@squide/core](https://www.npmjs.com/package/@squide/core)
- [@squide/react-router](https://www.npmjs.com/package/@squide/react-router)
- [@squide/webpack-module-federation](https://www.npmjs.com/package/@squide/webpack-module-federation)
- [@squide/msw](https://www.npmjs.com/package/@squide/msw)

For the full shared dependencies configuration, have a look at the [defineConfig.ts](https://github.com/gsoft-inc/wl-squide/blob/main/packages/firefly/src/defineConfig.ts) file on GitHub.

## Usage

### Define a webpack config

```js !#6 host/webpack.build.js
// @ts-check

import { defineBuildHostConfig } from "@squide/firefly/defineConfig.js";
import { swcConfig } from "./swc.build.js";

export default defineBuildHostConfig(swcConfig, "host");
```

### Activate additional features

```js !#7-9 host/webpack.build.js
// @ts-check

import { defineBuildHostConfig } from "@squide/firefly/defineConfig.js";
import { swcConfig } from "./swc.build.js";

export default defineBuildHostConfig(swcConfig, "host", {
    features: {
        i18next: true
    }
});
```


!!!info
Features must be activated on the host application as well as every remote module.
!!!

### Specify additional shared dependencies

```js !#7-11 host/webpack.build.js
// @ts-check

import { defineBuildHostConfig } from "@squide/firefly/defineConfig.js";
import { swcConfig } from "./swc.build.js";

export default defineBuildHostConfig(swcConfig, "host", {
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

```js !#7-11 host/webpack.build.js
// @ts-check

import { defineBuildHostConfig } from "@squide/firefly/defineConfig.js";
import { swcConfig } from "./swc.build.js";

export default defineBuildHostConfig(swcConfig, "host", {
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

```js !#7-11 host/webpack.build.js
// @ts-check

import { defineBuildHostConfig } from "@squide/firefly/defineConfig.js";
import { swcConfig } from "./swc.build.js";

export default defineBuildHostConfig(swcConfig, "host", {
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

```js !#7-9 host/webpack.build.js
// @ts-check

import { defineBuildHostConfig, defineHostModuleFederationPluginOptions } from "@squide/firefly/defineConfig.js";
import { swcConfig } from "./swc.build.js";

export default defineBuildHostConfig(swcConfig, "host", {
    moduleFederationPluginOptions: defineHostModuleFederationPluginOptions("host", {
        runtime: "my-runtime-name"
    })
});
```

- `applicationName`: The host application name.
- `moduleFederationPluginOptions`: An object literal of [ModuleFederationPlugin](https://webpack.js.org/plugins/module-federation-plugin/) options.



