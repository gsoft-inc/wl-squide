---
order: 100
toc:
    depth: 2-3
---

TODO: Something about Module Augmentation
    -> Should probably be in a guide but it should be linked to from somewhere in this page.

# EnvironmentVariablesPlugin

A plugin to faciliate the usage of environment variables in a modular application.

## Reference

```ts
const plugin = new EnvironmentVariablesPlugin()
```

### Parameters

None

## Usage

### Register the plugin

```ts !#5
import { EnvironmentVariablesPlugin } from "@squide/env-vars";
import { FireflyRuntime } from "@squide/firefly";

const runtime = new FireflyRuntime({
    plugins: [x => new EnvironmentVariablesPlugin(x)]
});
```

### Retrieve the plugin instance

```ts
import { EnvironmentVariablesPlugin } from "@squide/i18next";

const plugin = runtime.getPlugin(EnvironmentVariablesPlugin.name) as EnvironmentVariablesPlugin;
```

[!ref Prefer using `getEnvironmentVariablesPlugin` when possible](./getEnvironmentVariablesPlugin.md)

### Register an environment variable

```ts !#5
import { EnvironmentVariablesPlugin } from "@squide/i18next";

const plugin = runtime.getPlugin(EnvironmentVariablesPlugin.name) as EnvironmentVariablesPlugin;

plugin.registerVariable("apiBaseUrl", "https://my-api.com");
```

### Register multiple environment variables at once

```ts !#5-8
import { EnvironmentVariablesPlugin } from "@squide/i18next";

const plugin = runtime.getPlugin(EnvironmentVariablesPlugin.name) as EnvironmentVariablesPlugin;

plugin.registerVariables({
    apiBaseUrl: "https://my-api.com",
    loginPageUrl: "https://login.com"
});
```

### Retrieve a single environment variable

```ts !#5
import { EnvironmentVariablesPlugin } from "@squide/i18next";

const plugin = runtime.getPlugin(EnvironmentVariablesPlugin.name) as EnvironmentVariablesPlugin;

const apiBaseUrl = plugin.getVariable("apiBaseUrl");
```

### Retrieve all the environment variables

```ts !#5
import { EnvironmentVariablesPlugin } from "@squide/i18next";

const plugin = runtime.getPlugin(EnvironmentVariablesPlugin.name) as EnvironmentVariablesPlugin;

const variables = plugin.getVariables();
```
