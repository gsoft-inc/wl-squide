# LocalStorageSessionManager

A local storage session manager strictly for development purpose.

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
import { SessionMaLocalStorageSessionManagernager } from "@squide/fakes";
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

### Integrate with a Runtime instance

```ts !#8 host/src/session.ts
import type { SessionAccessorFunction } from "@squide/react-router";
import { LocalStorageSessionManager } from "@squide/fakes";
import type { Session } from "@sample/share";

export const sessionManager = new LocalStorageSessionManager<Session>();

export const sessionAccessor: SessionAccessorFunction = () => {
    return sessionManager.getSession();
};
```

```tsx !#4,6-8 host/src/bootstrap.tsx
import { createRoot } from "react";
import { Runtime, RuntimeContext } from "@squide/react-router";
import { App } from "./App";
import { sessionAccessor } from "./session";

const runtime = new Runtime({
    sessionAccessor
});

const root = createRoot(document.getElementById("root"));

root.render(
    <RuntimeContext.Provider value={runtime}>
        <App />
    </RuntimeContext.Provider>
);
```

```tsx !#4 remote-module/src/UserProfile.tsx
import { useSession } from "@squide/react-router";

export function UserProfile() {
    const session = useSession();

    return (
        <span>{session.userName}</span>
    );
}
```

