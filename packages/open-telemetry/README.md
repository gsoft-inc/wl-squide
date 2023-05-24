# @squide/open-telemetry

## Usage

### 1.Install the package

```bash
pnpm i @squide/open-telemetry
```

### 2. Initialize the tracing

At the entry point of your application, call `initTracing`:

```js
import { initTracing, trackingOptions } from '@squide/open-telemetry';

const trackingOptions = {
    endpointUrl: 'http://localhost:9411',
    backendUrlRegex: "*.localhost:3000",
    serviceName: 'my-service',
    trackRequest: true, // default false, track incoming requests
    trackFetch: true, // default false, track outgoing fetch requests
};

initTracing(trackingOptions);

// ...rest of the app's entry point code
```

This need to be called first to ensure that the tracing is initialized before any other module is loaded. From there on, the tracing is available to all other modules and Window is automatically track.

### 3. Use the tracing

```ts
import { Button } from '@mui/material'

import { traceSpan } from '@squide/open-telemetry';

interface Props {
    label: string;
    id?: string;
    secondary?: boolean;
    onClick: () => void;
}

export default (props: Props) => {
    const onClick = (): void => raceSpan(`'${props.label}' button clicked`, props.onClick);

    return (
        <div>
            <Button
                id={props.id}
                variant={"contained"}
                color={props.secondary ? "secondary" : "primary"}
                onClick={onClick}
            >
                {props.label}
            </Button>
        </div>
    );
};
```
