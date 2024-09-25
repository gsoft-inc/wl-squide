---
order: 80
toc:
    depth: 2-3
---

# useEnvironmentVariable

Retrieve a specific environment variable registered with the [EnvironmentVariablesPlugin](./EnvironmentVariablesPlugin.md) instance.

## Reference

```ts
const variable = useEnvironmentVariable("apiBaseUrl")
```

### Parameters

- `key`: The environment variable key.

### Returns

The environment variable value if there's a match, otherwise an `Error` is thrown.

## Usage

```ts
import { useEnvironmentVariable } from "@squide/env-vars";

const apiBaseUrl = useEnvironmentVariable("apiBaseUrl");
```
