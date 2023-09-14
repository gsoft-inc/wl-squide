---
order: 90
---

# Create a remote module

Remote modules are modules that are not included in the host application build but are instead **loaded at runtime** from a remote server. They provide a way for teams to be **fully autonomous** by **independently deploying** their modules without relying on the other parts of the application.

Let's add our first remote module!

## 1. Install the packages

Create a new application (we'll refer to ours as `remote-module`), then open a terminal at the root of the new solution and install the following packages:

+++ pnpm
```bash
pnpm add -D @workleap/webpack-configs @workleap/swc-configs @workleap/browserslist-config webpack webpack-dev-server webpack-cli @swc/core @swc/helpers browserslist postcss
pnpm add @squide/core @squide/react-router @squide/webpack-module-federation react react-dom react-router-dom
```
+++ yarn
```bash
yarn add -D @workleap/webpack-configs @workleap/swc-configs @workleap/browserslist-config webpack webpack-dev-server webpack-cli @swc/core @swc/helpers browserslist postcss
yarn add @squide/core @squide/react-router @squide/webpack-module-federation react react-dom react-router-dom
```
+++ npm
```bash
npm install -D @workleap/webpack-configs @workleap/swc-configs @workleap/browserslist-config webpack webpack-dev-server webpack-cli @swc/core @swc/helpers browserslist postcss
npm install @squide/core @squide/react-router @squide/webpack-module-federation react react-dom react-router-dom
```
+++

!!!warning
While you can use any package manager to develop an application with `@squide`, it is highly recommended that you use [PNPM](https://pnpm.io/) as the following guide has been developed and tested with PNPM.
!!!

## 2. Setup the application

### Application structure

First, create the following files:

```
remote-module
├── public
├──── index.html
├── src
├──── register.tsx
├──── Page.tsx
├── .browserslistrc
├── swc.dev.js
├── swc.build.js
├── webpack.dev.js
├── webpack.build.js
├── package.json
```

### package.json

Then, ensure that you are developing your module using [ESM syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) by specifying `type: module` in your `package.json` file:

```json remote-module/package.json
{
    "type": "module"
}
```

### Routes and navigation items registration

Then, register the remote module [routes](/reference/runtime/runtime-class.md#register-routes) and [navigation items](/reference/runtime/runtime-class.md#register-navigation-items):

```tsx !#6-11,13-18 remote-module/src/register.tsx
import type { ModuleRegisterFunction, Runtime } from "@squide/react-router";
import type { AppContext } from "@sample/shared";
import { Page } from "./Page.tsx";

export const register: ModuleRegisterFunction<Runtime, AppContext> = (runtime: Runtime, context: AppContext) => {
    runtime.registerRoutes([
        {
            path: "/remote/page",
            element: <Page />
        }
    ]);

    runtime.registerNavigationItems([
        {
            to: "/remote/page",
            label: "Remote/Page"
        }
    ]);
}
```

And finally, create the `<Page>` component:

```tsx remote-module/src/Page.tsx
export function Page() {
    return (
        <div>Hello from Remote/Page!</div>
    );
}
```

## 3. Configure webpack

!!!info
`@squide` webpack configuration is built on top of [@workleap/webpack-configs](https://gsoft-inc.github.io/wl-web-configs/webpack/), [@workleap/browserslist-config](https://gsoft-inc.github.io/wl-web-configs/browserslist/) and [@workleap/swc-configs](https://gsoft-inc.github.io/wl-web-configs/swc/). If you are having issues with the configuration of these tools, refer to the tools documentation websites.
!!!

### HTML template

First, open the `public/index.html` file created at the beginning of this guide and copy/paste the following [HtmlWebpackPlugin](https://webpack.js.org/plugins/html-webpack-plugin/) template:

```html host/public/index.html
<!DOCTYPE html>
<html>
    <head>
    </head>
    <body>
        <div id="root"></div>
    </body>
</html>
```

### Browserslist

Then, open the `.browserslist` file and copy/paste the following content:

``` host/.browserslistrc
extends @workleap/browserslist-config
```

### Development configuration

To configure webpack for a **development** environment, first open the `swc.dev.js` file and copy/paste the following code:

```js remote-module/swc.dev.js
// @ts-check

import { browserslistToSwc, defineDevConfig } from "@workleap/swc-configs";

const targets = browserslistToSwc();

export const swcConfig = defineDevConfig(targets);
```

Then, open the `webpack.dev.js` file and use the the [defineDevRemoteModuleConfig](/reference/webpack/defineDevRemoteModuleConfig.md) function to configure webpack:

```js !#6 remote-module/webpack.dev.js
// @ts-check

import { defineDevRemoteModuleConfig } from "@squide/webpack-module-federation/defineConfig.js";
import { swcConfig } from "./swc.dev.js";

export default defineDevRemoteModuleConfig(swcConfig, "remote1", 8081);
```

!!!info
If you are having issues with the wepack configuration that are not related to module federation, refer to the [@workleap/webpack-configs documentation](https://gsoft-inc.github.io/wl-web-configs/webpack/configure-dev/).
!!!

### Build configuration

To configure webpack for a **build** environment, first open the `swc.build.js` file and copy/paste the following code:

```js remote-module/swc.build.js
// @ts-check

import { browserslistToSwc, defineBuildConfig } from "@workleap/swc-configs";

const targets = browserslistToSwc();

export const swcConfig = defineBuildConfig(targets);
```

Then, open the `webpack.build.js` file and use the the [defineBuildRemoteModuleConfig](/reference/webpack/defineBuildRemoteModuleConfig.md) function to configure webpack:

```js !#6 remote-module/webpack.build.js
// @ts-check

import { defineBuildRemoteModuleConfig } from "@squide/webpack-module-federation/defineConfig.js";
import { swcConfig } from "./swc.build.js";

export default defineBuildRemoteModuleConfig(swcConfig, "remote1", "http://localhost:8081/");
```

!!!info
If you are having issues with the wepack configuration that are not related to module federation, refer to the [@workleap/webpack-configs documentation](https://gsoft-inc.github.io/wl-web-configs/webpack/configure-build/).
!!!

## 4. Add CLI scripts

To initiate the development server, add the following script to the application `package.json` file:

```json remote-module/package.json
{
    "dev": "webpack serve --config webpack.dev.js"
}
```

To build the module, add the following script to the application `package.json` file:

```json remote-module/package.json
{
    "build": "webpack --config webpack.build.js"
}
```

## 5. Try the application :rocket:

Start the `host` and the `remote-module` applications in development mode using the `dev` script. You should notice an additional link in the navigation menu. Click on the link to navigate to the page of your new **remote** module!

## 6. Sample module

For a functional sample of a **remote** module, have a look at the `@sample/remote-module` application of the `@squide` sandbox on [GitHub](https://github.com/gsoft-inc/wl-squide/tree/main/sample/remote-module).

