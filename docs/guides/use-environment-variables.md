---
order: 830
---

# Use environment variables

Environment variables are incredibly useful when working with **multiple environments**, such as `dev`, `staging`, and `production`, by **decoupling configuration from** the **code**. This allows to change an application's behavior without modifying the code itself. A common example is the URLs of dedicated API services, where each environment uses a different URL.

In webpack, environment variables are typically passed from the CLI to the application code using the [DefinePlugin](https://webpack.js.org/plugins/define-plugin/) and accessed through `process.env`, e.g. `process.env.BASE_API_URL`.

While accessing environment variables from `process.env` works, dealing with JavaScript global scope has a few downsides:

- **It's not ideal for testing**. Code under test that expects an environment variable to be accessible from `process.env` will fail if the value is not mocked or defined.
- **It's not well-suited for Storybook**. Story code that expects an environment variable to be accessible from `process.env` will fail if the value is not defined.
- **It complicates** [module development in isolation](./develop-a-module-in-isolation.md). A modular application [shell](./develop-a-module-in-isolation.md#create-a-shell-package) often makes requests to multiple endpoints, which vary depending on the environment. These endpoints require environment variables to define their URLs. When developing modules in isolation, modules should not provide these environment variables to the shell. Instead, the shell library should manage these environment variables.

To replace `process.env`, Squide provides the [EnvironmentVariablesPlugin](../reference/env-vars/getEnvironmentVariablesPlugin.md). This plugin acts as a registry and integrates with the [Runtime API](../reference/runtime/runtime-class.md), allowing modules to register and retrieve environment variables.

Before this plugin, page code would directly rely on `process.env`:

```tsx !#6
import { fetchJson } from "@sample/shared";
import { useSuspenseQuery } from "@tanstack/react-query";

export function Page() {
    const { data } = useSuspenseQuery({ queryKey: [`${process.env.baseApiUrl}/getData`], queryFn: () => {
        return fetchJson(`${process.env.baseApiUrl}/getData`);
    } });

    return (
        <div>{JSON.stringify(data)}</div>
    );
}
```

With the `EnvironmentVariablesPlugin`, a React page can now retrieve the `baseApiUrl` from Squide's runtime instance by using the [useEnvironmentVariable](../reference/env-vars/useEnvironmentVariable.md) hook:

```tsx !#6,9
import { useEnvironmentVariable } from "@squide/env-vars";
import { fetchJson } from "@sample/shared";
import { useSuspenseQuery } from "@tanstack/react-query";

export function Page() {
    const baseApiUrl = useEnvironmentVariable("baseApiUrl");

    const { data } = useSuspenseQuery({ queryKey: [`${baseApiUrl}/getData`], queryFn: () => {
        return fetchJson(`${baseApiUrl}/getData`);
    } });

    return (
        <div>{JSON.stringify(data)}</div>
    );
}
```

Let's go through the installation of the plugin and how to handle a few use cases.

## Install the package

First, open an existing Squide application. Then open a terminal at the root of the host application and install the following package:

+++ pnpm
```bash
pnpm add @squide/env-vars
```
+++ yarn
```bash
yarn add @squide/env-vars
```
+++ npm
```bash
npm install @squide/env-vars
```
+++

!!!warning
While you can use any package manager to develop an application with Squide, it is highly recommended that you use [PNPM](https://pnpm.io/) as the guides has been developed and tested with PNPM.
!!!

## Setup the plugin

Then, update the host application boostrapping code to register an instance of the [EnvironmentVariablesPlugin](../reference/env-vars/EnvironmentVariablesPlugin.md) with the [FireflyRuntime](../reference/runtime/runtime-class.md) instance:

```tsx !#13 host/src/bootstrap.tsx
import { createRoot } from "react-dom/client";
import { ConsoleLogger, RuntimeContext, FireflyRuntime, registerRemoteModules, type RemoteDefinition } from "@squide/firefly";
import { EnvironmentVariablesPlugin } from "@squide/env-vars";
import { App } from "./App.tsx";
import { registerHost } from "./register.tsx";
import { registerShell } from "@sample/shell";

const Remotes: RemoteDefinition[] = [
    { url: name: "remote1" }
];

const runtime = new FireflyRuntime({
    plugins: [x => new EnvironmentVariablesPlugin(x)],
    loggers: [new ConsoleLogger()]
});

await registerLocalModules([registerShell, registerHost], runtime);

await registerRemoteModules(Remotes, runtime);

const root = createRoot(document.getElementById("root")!);

root.render(
    <RuntimeContext.Provider value={runtime}>
        <App />
    </RuntimeContext.Provider>
);
```

### Module augmentation

Before registering variables, modules must [augment](https://www.typescriptlang.org/docs/handbook/declaration-merging.html#module-augmentation) the `EnvironmentVariables` TypeScript interface with the variables they intend to register to ensure type safety and autocompletion.

To do this, first create a `types` folder:

``` !#7-8
host
├── src
├────── register.tsx
├────── Page.tsx
├────── index.tsx
├────── App.tsx
├── types
├────── env-vars.d.ts
```

Then create an `env-vars.d.ts` file:

```ts !#5 host/types/env-vars.d.ts
import "@squide/env-vars";

declare module "@squide/env-vars" {
    interface EnvironmentVariables {
        baseApiUrl: string;
    }
}
```

In the example above, the module only intends to register the `baseApiUrl` environment variable.

Finally, update the module `tsconfig.json` to include the `types` folder:

```json !#3 host/tsconfig.json
{
    "extends": "@workleap/typescript-configs/web-application.json",
    "include": ["src", "types"],
    "exclude": ["dist", "node_modules"]
}
```

### Register variables

Now, let's register our first variable. We recommend registering environment variables in the module's `register` function as it's the most logical place to access the runtime instance:

```tsx !#7-11 host/src/register.tsx
import { PublicRoutes, ProtectedRoutes, type ModuleRegisterFunction, type FireflyRuntime } from "@squide/firefly";
import { getEnvironmentVariablesPlugin } from "@squide/env-vars";
import { HomePage } from "./HomePage.tsx";
import { NotFoundPage } from "./NotFoundPage.tsx";
import { RootLayout } from "./RootLayout.tsx";

function registerEnvironmentVariables(runtime: FireflyRuntime) {
    const plugin = getEnvironmentVariablesPlugin(runtime);

    plugin.registerVariable("baseApiUrl", "http://my-domain.com/api");
}

export const registerHost: ModuleRegisterFunction<FireflyRuntime> = runtime => {
    registerEnvironmentVariables(runtime);

    runtime.registerRoute({
        element: <RootLayout />,
        children: [
            // Placeholders indicating where non hoisted or nested public and protected routes will be rendered.
            PublicRoutes,
            ProtectedRoutes
        ]
    }, {
        hoist: true
    });

    runtime.registerPublicRoute({
        path: "*",
        element: <NotFoundPage />
    });

    runtime.registerRoute({
        index: true,
        element: <HomePage />
    });
};
```

!!!info
If multiple modules need to use the same environment variable, we recommend that each module register its own instance of the variable to maintain modularity. The `EnvironmentVariablesPlugin` registry will ignore any subsequent registrations for existing keys, as long as the variable value remains the same.
!!!

### Retrieve a variable in React code

Then, retrieve the variables in React code using either [useEnvironmentVariable](../reference/env-vars/useEnvironmentVariable.md) or [useEnvironmentVariables](../reference/env-vars/useEnvironmentVariables.md):

```tsx !#6 host/src/Pages.tsx
import { useEnvironmentVariable } from "@squide/env-vars";
import { fetchJson } from "@sample/shared";
import { useSuspenseQuery } from "@tanstack/react-query";

export function Page() {
    const baseApiUrl = useEnvironmentVariable("baseApiUrl");

    const { data } = useSuspenseQuery({ queryKey: [`${baseApiUrl}/getData`], queryFn: () => {
        return fetchJson(`${baseApiUrl}/getData`);
    } });

    return (
        <div>{JSON.stringify(data)}</div>
    );
}
```

### Retrieve a variable for MSW handlers

## Use the plugin for tests

## Use the plugin for stories

## Use the plugin for libraries

## Try it :rocket:


- Setup
    - register the plugin
    - module augmentation
    - register variables
    - retrieve variable in React code
    - retrieve variable for MSW handlers


- How to use this for tests
- How to use this with Storybook and Chromatic
- How to use this for library code like the shell
