---
toc:
    depth: 2-3
---

# Service

An abstract base class to define a service.

## Usage

### Define a custom service

```ts !#3 shared/src/telemetryService.ts
import { Service } from "@squide/core";

export class TelemetryService extends Service {
    constructor() {
        super(TelemetryService.name);
    }
}
```

### Register a service

```ts !#4 host/src/boostrap.tsx
import { TelemetryService } from "@sample/shared";

const runtime = new Runtime({
    services: [new TelemetryService()]
});
```

### Retrieve a service from a runtime instance

```ts
import { TelemetryService } from "@sample/shared";

const telemetryService = runtime.getService(TelemetryService.name);
```

### Retrieve a service with the `useService` hook

```ts
import { useService } from "@squide/react-router";
import { TelemetryService } from "@sample/shared";

const telemetryService = runtime.getService(TelemetryService.name);
```

### Retrieve a service with a custom function or a hook

We recommend pairing a custom service definition with a custom function or hook to retrieve the service from a runtime instance.

```ts !#9-11,13-17 shared/src/telemetryService.ts
import { Service, useRuntime, type Runtime } from "@squide/react-router";

export class TelemetryService extends Service {
    constructor() {
        super(TelemetryService.name);
    }
}

export function getTelemetryService(runtime: Runtime) {
    return runtime.getService(TelemetryService.name) as TelemetryService;
}

export function useTelemetryService() {
    const runtime = useRuntime();

    return runtime.getService(TelemetryService.name) as TelemetryService;
}
```

```ts
import { getTelemetryService } from "@sample/shared";

const telemetryService = getTelemetryService(runtime);
```

```ts
import { useTelemetryService } from "@sample/shared";

const telemetryService = useTelemetryService();
```

Retrieving a service with a custom function or hook doesn't require the consumer to remember the service name, and has the upside of inferring the typings.







