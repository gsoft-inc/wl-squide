# @squide/module-federation

## 5.0.0

### Major Changes

- [#168](https://github.com/gsoft-inc/wl-squide/pull/168) [`89ace29`](https://github.com/gsoft-inc/wl-squide/commit/89ace29b9aeadbbe83cfa71dd137b9f1a115c283) Thanks [@patricklafrance](https://github.com/patricklafrance)! - This release Migrates Squide from Webpack Module Federation to [Module Federation 2.0](https://module-federation.io/guide/start/quick-start.html).

  This release deprecates the following packages:

  - `@squide/webpack-module-federation`, use `@squide/module-federation` instead.
  - `@squide/firefly-configs`, use `@squide/firefly-webpack-configs` instead.

  And introduce a few changes to existing API:

  - The `FireflyRuntime` nows accept a `useMsw` option and expose a new `isMswEnabled` getter:

  ```ts
  // bootstrap.tsx

  import { FireflyRuntime } from "@squide/firefly";

  const runtime = new FireflyRuntime({
    useMsw: true,
  });

  // Use the runtime to determine if MSW handlers should be registered.
  if (runtime.isMswEnabled) {
    // ...
  }
  ```

  - The `registerRemoteModules` function doesn't accept the remotes URL anymore. The remotes URL should be configured in the webpack configuration files.

  Previously:

  ```ts
  // bootstrap.tsx

  import {
    registerRemoteModules,
    type RemoteDefinition,
  } from "@squide/firefly";

  const Remotes: RemoteDefinition = [
    {
      name: "remote1",
      url: "http://localhost:8081",
    },
  ];

  await registerRemoteModules(Remotes, runtime);
  ```

  ```js
  // webpack.dev.js

  import { defineDevHostConfig } from "@squide/firefly-webpack-configs";
  import { swcConfig } from "./swc.dev.js";

  export default defineDevHostConfig(swcConfig, 8080, {
    overlay: false,
  });
  ```

  Now:

  ```ts
  // bootstrap.tsx

  import {
    registerRemoteModules,
    type RemoteDefinition,
  } from "@squide/firefly";

  const Remotes: RemoteDefinition = [
    {
      name: "remote1",
    },
  ];

  await registerRemoteModules(Remotes, runtime);
  ```

  ```js
  // webpack.dev.js

  import { defineDevHostConfig } from "@squide/firefly-webpack-configs";
  import { swcConfig } from "./swc.dev.js";

  /**
   * @typedef {import("@squide/firefly-webpack-configs").RemoteDefinition}[]
   */
  export const Remotes = [
    {
      name: "remote1",
      url: "http://localhost:8081",
    },
  ];

  export default defineDevHostConfig(swcConfig, 8080, Remotes, {
    overlay: false,
  });
  ```

  To migrate:

  1. Replace the `@squide/webpack-module-federation` dependency by `@squide/module-federation`.

  2. Replace the `@squide/firefly-configs` dependency by `@squide/firefly-webpack-configs`.

  3. Move the remotes URL from the `bootstrap.tsx` file to the `webpack.*.js` files.

  4. Integrate the new `useMsw` and `isMswEnabled` props.

### Patch Changes

- Updated dependencies [[`89ace29`](https://github.com/gsoft-inc/wl-squide/commit/89ace29b9aeadbbe83cfa71dd137b9f1a115c283)]:
  - @squide/core@4.0.0
