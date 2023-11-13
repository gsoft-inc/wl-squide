---
toc:
    depth: 2-3
---

# useSession

Retrieve the current session from the `FireflyRuntime` instance.

## Reference

```ts
const session = useSession()
```

### Parameters

None

### Returns

A custom session object.

## Usage

```ts
import { useSession } from "@squide/firefly";
import type { AppSession } from "@sample/shared";
 
const session = useSession() as AppSession;

const userName = session.userName;
```
