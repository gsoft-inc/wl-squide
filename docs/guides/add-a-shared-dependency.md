---
order: 30
label: Add a shared dependency
---

# Add a shared dependency

[Shared dependencies](https://webpack.js.org/plugins/module-federation-plugin/#sharing-libraries) represent one of the most powerful concepts within [Module Federation](https://webpack.js.org/plugins/module-federation-plugin). However, mastering this aspect can be quite challenging. **Failure** to configure shared dependencies properly in a federated application using Module Federation can significantly **impact** both **user** and **developer experiences**.

Squide aims to simplify the configuration of shared dependencies by abstracting the [fundamental shared dependencies](#default-shared-dependencies) necessary for building an application with React and React Router. Nevertheless, every federated application will inevitably have to configure additional custom shared dependencies.

For a more comprehensive documentation of the Module Federation APIs, their functionality, and their benefits, please refer to this [article](https://www.infoxicator.com/en/module-federation-shared-api).

## Default shared dependencies

Since Squide has dependencies on React and React Router, the [define*](../reference/default.md#webpack) functions automatically configure shared dependencies for these packages by default, in addition to Squide own packages. The following shared dependencies are set as [eager](#eager-dependency) [singleton](#singleton-dependency) by default:

- [react](https://www.npmjs.com/package/react)
- [react-dom](https://www.npmjs.com/package/react-dom)
- [react-router-dom](https://www.npmjs.com/package/react-router-dom)
- [@squide/core](https://www.npmjs.com/package/@squide/core)
- [@squide/react-router](https://www.npmjs.com/package/@squide/react-router)
- [@squide/webpack-module-federation](https://www.npmjs.com/package/@squide/webpack-module-federation)

For the full shared dependencies configuration, have a look at the [defineConfig.ts](https://github.com/gsoft-inc/wl-squide/blob/main/packages/webpack-module-federation/src/defineConfig.ts) file on Github.

> You can [extend](../reference/webpack/defineDevHostConfig.md#extend-a-default-shared-dependency) or [override](../reference/webpack/defineDevHostConfig.md#override-a-default-shared-dependency) the default shared dependencies configuration.

## What should be configured as a shared dependency?

Libraries matching the following criterias are strong candidates to be configured as shared dependencies:

- Medium to large libraries that are used by multiple modules..
- Libraries that requires a [single instance](#react) to work properly (like `react`).
- Libraries exporting [React contexts](#react-context-limitations).

## Adding shared dependencies

To configure shared dependencies, use the `sharedDependencies` option of any [define*](../reference/default.md#webpack) function:

```js !#7-11 host/webpack.dev.js
// @ts-check

import { defineDevHostConfig } from "@squide/webpack-module-federation/defineConfig.js";
import { swcConfig } from "./swc.dev.js";

export default defineDevHostConfig(swcConfig, "host", 8080, {
    sharedDependencies: {
        "@sample/shared": {
            singleton: true
        }
    }
});
```

When a dependency is shared between a host application and a remote module, the sharing options must be **configured on both ends**:

```js !#7-11 remote-module/webpack.dev.js
// @ts-check

import { defineDevRemoteModuleConfig } from "@squide/webpack-module-federation/defineConfig.js";
import { swcConfig } from "./swc.dev.js";

export default defineDevRemoteModuleConfig(swcConfig, "remote1", 8081, {
    sharedDependencies: {
        "@sample/shared": {
            singleton: true
        }
    }
});
```

## Singleton dependency

A [singleton](https://webpack.js.org/plugins/module-federation-plugin/#singleton) shared dependency does exactly what its name suggests: it loads only a single instance of the dependency. This means that the dependency will be included in just one bundle file of the federated application.

### `strictVersion`

Sometimes, a `singleton` shared dependency is paired with the [strictVersion](https://webpack.js.org/plugins/module-federation-plugin/#strictversion) option:

```js !#10 webpack.config.js
// @ts-check

import { defineDevHostConfig } from "@squide/webpack-module-federation/defineConfig.js";
import { swcConfig } from "./swc.dev.js";

export default defineDevHostConfig(swcConfig, "host", 8080, {
    sharedDependencies: {
        "@sample/shared": {
            singleton: true,
            strictVersion: "1.2.1"
        }
    }
});
```

When specified, the `strictVersion` option will generate a **runtime error** if a module attempts to load a **version** of the dependency that is **incompatible** with the specified version. It's **often unnecessary** to use a strict version, and omitting it provides greater flexibility when it comes time to update the shared dependency version.

### Expected behaviors

#### Minor or patch version

When the version difference between a host application and a remote module is a **minor** or **patch** version, the higher version of the dependency will be loaded. For example:

- If the host application is on `10.1.0` and a remote module is on `10.3.1` -> `10.3.1` will be loaded
- If the host application is on `10.3.1` and a remote module is on `10.1.0` -> `10.3.1` will be loaded

#### Major version

If the version difference between a host application and a remote module is a **major** version, once again, the higher version of the dependency will be loaded. However, a **warning** will also be issued. For example:

- If the host application is on `11.0.0` and a remote module is on `10.3.1` -> `11.0.0` will be loaded
- If the host application is on `10.3.1` and a remote module is on `11.0.0` -> `11.0.0` will be loaded

## Eager dependency

An [eager](https://webpack.js.org/plugins/module-federation-plugin/#eager) shared dependency becomes available as soon as the host application starts. In simple terms, it is included in the host application bundle rather than being loaded lazily when it is first requested.

```js !#10 webpack.config.js
// @ts-check

import { defineDevHostConfig } from "@squide/webpack-module-federation/defineConfig.js";
import { swcConfig } from "./swc.dev.js";

export default defineDevHostConfig(swcConfig, "host", 8080, {
    sharedDependencies: {
        "@sample/shared": {
            singleton: true,
            eager: true
        }
    }
});
```

The key point to remember about `eager` dependencies is that **only one application or remote module should configure a shared dependency as eager**. Otherwise, the dependency will be included in the bundler of every application or remote module that set the dependency as `eager`.

## React context limitations

For a React context to be provided by the host application and consumed by the remote modules, the library exporting the React context must be set as a `singleton`.

To troubleshoot a React context issue or find more information about the limitations, refer to the [troubleshooting](../troubleshooting.md#react-context-values-are-undefined) page.

## `react`

`react` and `react-dom` dependencies must be configured as a `singleton`, otherwise either an error will be thrown at bootstrapping if the loaded `react` versions are incompatible, or features like `useState` will not work.

## `react-router-dom`

The `react-router-dom` dependency must be configured as a `singleton` because it relies on a global React context that needs to be declared in the host application and is consumed by remote modules.

## Learn more

To learn more about Module Federation shared dependencies read this [article](https://www.infoxicator.com/en/module-federation-shared-api) about the shared APIs and refer to this [POC](https://github.com/patricklafrance/wmf-versioning) on GitHub.
