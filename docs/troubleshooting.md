---
order: 60
icon: question
---

# Troubleshooting

## Set the runtime mode to development

In an effort to optimize the development experience, Squide can be bootstrapped in `development` or `production` mode. To troubleshoot a persistent issue, make sure that the runtime mode is development:

```ts
import { FireflyRuntime, ConsoleLogger, type LogLevel } from "@squide/firefly";

const runtime = new FireflyRuntime({
    mode: "development"
});
```

## React context values are undefined

If you are encountering undefined values when providing a React context from the host application and consuming the context in modules, it is likely due to two possible reasons: either you have two instances of React, or you have multiple instances of that React context.

To resolve this issue:

1. Ensure that the `react` and `react-dom` dependencies are shared as [singletons](https://module-federation.io/configure/shared.html#singleton) between the host application and the remote modules. A React context value cannot be shared between different parts of an application that use different instances of React.

2. Confirm that the shared React context resides in a library shared as a [singleton](https://module-federation.io/configure/shared.html#singleton).

3. If you are using [eager](https://module-federation.io/configure/shared.html#eager) shared dependencies, ensure that ONLY the host application configures these dependencies as `eager`.

If the issue persists, update your host application and remote module's webpack build configuration with the `optimize: false` option. Afterward, build the bundles and serve them. Open a web browser, access the DevTools, switch to the Network tab (ensure that JS files are listed), navigate to the application's homepage, and inspect the downloaded bundle files. The problematic React context definition should appear only once; otherwise, you may have multiple instances of the React context.

For additional information on shared dependency versioning, please refer to the [add a shared dependency guide](./guides/add-a-shared-dependency.md) and https://github.com/patricklafrance/wmf-versioning.
