# SessionManager

A local session manager strictly for development purpose.

## Reference

```ts
const sessionManager = new SessionManager(options?: { key? })
```

### Parameters

- `options`: An optional object literal of options.
    - `key`: An optional key identifying the session in `localStorage`.

## Usage

### Create a SessionManager instance

```ts
import { SessionManager } from "@squide/fakes";
import type { Session } from "@sample/share";

const sessionManager = new SessionManager<Session>();
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

```ts !#7-9 host/session.ts
import type { SessionAccessorFunction } from "@squide/react-router";
import { SessionManager } from "@squide/fakes";
import type { Session } from "@sample/share";

export const sessionManager = new SessionManager<Session>();

export const sessionAccessor: SessionAccessorFunction = () => {
    return sessionManager.getSession();
};
```

```tsx !#4,6-8 host/bootstrap.tsx
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

