---
order: 70
toc:
    depth: 2-3
---

# useEnvironmentVariables

Retrieve all the environment variables registered with the [EnvironmentVariablesPlugin](./EnvironmentVariablesPlugin.md) instance.

## Reference

```ts
const variables = useEnvironmentVariables()
```

### Parameters

None

### Returns

Returns all registered environment variables as an object literal. If no environment variables are registered, an empty object literal is returned.

## Usage

```ts
import { useEnvironmentVariables } from "@squide/env-vars";

const variables = useEnvironmentVariables();
```
