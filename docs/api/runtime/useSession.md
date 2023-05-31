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

```tsx !#6-8 bootstrap.tsx
import { createRoot } from "react-dom/client";
import { Runtime, RuntimeContext } from "@squide/react-router";
import { SessionManager } from "@squide/fakes";

const runtime = new Runtime({
    sessionAccessor: () => {
        return sessionManager.getSession();
    };
});

const root = createRoot(document.getElementById("root"));

root.render(
    <RuntimeContext.Provider value={runtime}>
        <App />
    </RuntimeContext.Provider>
);
```
