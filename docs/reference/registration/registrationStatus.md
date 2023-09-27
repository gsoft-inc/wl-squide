---
toc:
    depth: 2-3
---

# registrationStatus

Variable indicating whether or not the remote modules registration process is completed.

## Usage

```ts
import { registrationStatus } from "@squide/webpack-module-federation";

if (registrationStatus !== "ready") {
    // do something...
}
```
