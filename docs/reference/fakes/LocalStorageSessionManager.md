---
toc:
    depth: 2-3
---

# LocalStorageSessionManager

A local storage session manager (strictly for development purpose).

## Reference

```ts
const sessionManager = new LocalStorageSessionManager(options?: { key? })
```

### Parameters

- `options`: An optional object literal of options:
    - `key`: An optional key identifying the session in `localStorage`.

## Usage

### Create a manager instance

```ts
import { LocalStorageSessionManager } from "@squide/fakes";
import type { Session } from "@sample/share";

const sessionManager = new LocalStorageSessionManager<Session>();
```

### Set a session

```ts
sessionManager.setSession({ username: "Foo" });
```

### Get the current session

```ts
const session = sessionManager.getSession();
```

### Clear the current session

```ts
sessionManager.clearSession();
```

