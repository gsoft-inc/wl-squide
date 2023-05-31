# registerRemoteModule

Register one or many remote module(s). During registration, the module `register` function will be called with a `Runtime` instance and an optional `context` object.

By convention, a remote module must:
- Expose a `/remoteEntry.js` entry point.
- Export a `register.js` module with a signature matching `ModuleRegisterFunction` typing.

## Reference

```ts
registerRemoteModule(remotes: [], runtime, options?: { context? })
```

### Parameters

- `remotes`: An array of `RemoteDefinition`.
- `runtime`: A `Runtime` instance.
- `options`: An optional object literal of options.
    - `context`: An optional context object that will be pass to the registration function.

### Returns

A `Promise` object with an array of [RegistrationError] if any happens during the registration.

## Usage

```tsx !#15 host/bootstrap.tsx
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

```tsx !#7-21 remote-module/register.tsx
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
