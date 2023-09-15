---
order: 10
---

# Deploy

The deployment process for a federated application can vary depending on various factors, including the chosen hosting provider. Therefore, we do not recommend any specific deployment setup.

However, there are a few essential configurations that need to be made regardless of your deployment choices.

## Default redirect

To enable support for direct page hits, add the following redirect rule to your host application's hosting provider:

```
/* /index.html 200
```

## Remote URL

Updates the application remote module production URL:

```ts
import { RemoteDefinition } from "@squide/webpack-module-federation";

const Remotes: RemoteDefinition[] = [
    {
        name: "remote1",
        url: process.env.isNetlify ? "https://squide-remote-module.netlify.app" : "http://localhost:8081"
    }
];
```

## Runtime mode

Don't forget to change the Runtime [mode](../reference/runtime/runtime-class.md#change-the-runtime-mode) to `"production"`:

```ts
import { Runtime } from "@squide/react-router";

const runtime = new Runtime({
    mode: process.env.isNetlify ? "production" : "development"
});
```

## Console logger

We suggest to remove [ConsoleLogger](../reference/logging/ConsoleLogger.md) for the production build:

```ts
import { ConsoleLogger, Runtime } from "@squide/react-router";

const runtime = new Runtime({
    loggers: process.env.isNetlify ? [] : [new ConsoleLogger()]
});
```
