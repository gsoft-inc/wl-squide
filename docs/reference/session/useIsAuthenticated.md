---
toc:
    depth: 2-3
---

# useIsAuthenticated

Indicate whether or not the user is authenticated.

> If the [sessionAccessor](/reference/runtime/runtime-class.md) function return a non `null` / `undefined` value, a user is considered as authenticated.

## Reference

```ts
const isAuthenticated = useIsAuthenticated()
```

### Parameters

None

### Returns

A boolean value.

## Usage

```ts
import { useIsAuthenticated } from "@squide/react-router";
 
const isAuthentication = useIsAuthenticated();
```
