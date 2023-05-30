# useSession

Retrieve the current session from the `Runtime` instance provided by `RuntimeContext`.

## Reference

```ts
useSession()
```

### Parameters

None

### Returns

A custom session object.

## Usage

```ts !#4
import { useSession } from "@squide/react-router";
import type { AppSession } from "@sample/shared";
 
const session = useSession() as AppSession;

const userName = session.userName;
```
