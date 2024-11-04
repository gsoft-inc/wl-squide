---
toc:
    depth: 2-3
---

# registerHoneycombInstrumentation

Initializes an instance of [Honeycomb Web SDK](https://docs.honeycomb.io/send-data/javascript-browser/honeycomb-distribution) and registers custom instrumentation to monitor the performance of a Squide application.

## Reference

```ts
registerHoneycombInstrumentation(runtime, serviceName, apiServiceUrls: string | Regex, options?: {})
```

### Parameters

- `runtime`: A `FireflyRuntime` instance.
- `serviceName`: Honeycomb application service name.
- `apiServiceUrls`: A `RegExp` or `string` that matches the URLs of the application's backend services. If unsure, use the temporary regex `/.+/g,` to match all URLs.
- `options`: An optional object literal of options:
    - `endpoint`: An optional URL to an [OpenTelemetry collector](https://docs.honeycomb.io/send-data/opentelemetry/collector/). Either `endpoint` or `apiKey` option must be provided.
    - `apiKey`: An optional Honeycomb [ingestion API key](https://docs.honeycomb.io/get-started/configure/environments/manage-api-keys/#create-api-key). Either `endpoint` or `apiKey` option must be provided.
    - `debug`: An optional `boolean` value indicating whether or not to log debug information to the console. `true` by default when the [runtime](../runtime/runtime-class.md) mode is set to `development`.
    - `instrumentations`: An optional array of [instrumentation](https://opentelemetry.io/docs/languages/js/instrumentation/) instances.
    - `spanProcessors`: An optional array of [span processor](https://docs.honeycomb.io/send-data/javascript-browser/honeycomb-distribution/#custom-span-processing) instances.
    - `fetchInstrumentation`: An optional object literal accepting any [@opentelemetry/instrumentation-fetch](https://github.com/open-telemetry/opentelemetry-js/tree/main/experimental/packages/opentelemetry-instrumentation-fetch#fetch-instrumentation-options) options or `false` to disable instrumentation for [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API).
    - `xmlHttpRequestInstrumentation`: An optional object literal accepting any [@opentelemetry/instrumentation-xml-http-request](https://github.com/open-telemetry/opentelemetry-js/tree/main/experimental/packages/opentelemetry-instrumentation-xml-http-request#xhr-instrumentation-options) options. [XHR](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest) instrumentation is disabled by default.
    - `documentLoadInstrumentation`: An optional object literal accepting any [@opentelemetry/instrumentation-document-load](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/plugins/web/opentelemetry-instrumentation-document-load#document-load-instrumentation-options) options or `false` to disable instrumentation for [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API).
    - `userInteractionInstrumentation`: An optional object literal accepting any [@opentelemetry/instrumentation-user-interaction](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/plugins/web/opentelemetry-instrumentation-user-interaction) options. User interactions instrumentation is disabled by default.
    - `transformers`: An optional array of [configuration transformers](#configuration-transformers).

### Returns

Nothing

### Default instrumentation

The `registerHoneycombInstrumentation` function registers the following OpenTelemetry instrumentations by default:

- [@opentelemetry/instrumentation-fetch](https://github.com/open-telemetry/opentelemetry-js/tree/main/experimental/packages/opentelemetry-instrumentation-fetch)
- [@opentelemetry/instrumentation-document-load](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/plugins/web/opentelemetry-instrumentation-document-load)

For more details, refer to the [registerHoneycombInstrumentation.ts](https://github.com/gsoft-inc/wl-squide/blob/main/packages/firefly-honeycomb/src/registerHoneycombInstrumentation.ts) file on GitHub.

## Usage

### Register instrumentation

```ts bootstrap.tsx
import { registerHoneycombInstrumentation } from "@squide/firefly-honeycomb";

registerHoneycombInstrumentation(runtime, "endpoints-sample", [/.+/g,], {
    endpoint: "https://my-collector"
});
```

### Use an API key

```ts !#4 bootstrap.tsx
import { registerHoneycombInstrumentation } from "@squide/firefly-honeycomb";

registerHoneycombInstrumentation(runtime, "endpoints-sample", [/.+/g,], {
    apiKey: "xyz123"
});
```

### Customize backend URLs

An application shouldn't use `[/.+/g,]` in production as it could leak customers data to third parties. Make sure to provide a value matching your application backend URLs.

```ts !#5 bootstrap.tsx
import { registerHoneycombInstrumentation } from "@squide/firefly-honeycomb";

registerHoneycombInstrumentation(
    runtime, "endpoints-sample", 
    [/https:\/\/workleap.com\/api\.*/], 
    { endpoint: "https://my-collector" }
);
```

### Register custom instrumentation

```ts !#6-8 bootstrap.tsx
import { registerHoneycombInstrumentation } from "@squide/firefly-honeycomb";
import { LongTaskInstrumentation } from "@opentelemetry/instrumentation-long-task";

registerHoneycombInstrumentation(runtime, "endpoints-sample", [/.+/g,], {
    endpoint: "https://my-collector",
    instrumentations: [
        new LongTaskInstrumentation()
    ]
});
```

### Register a span processor

```ts CustomSpanPressor.ts
export class CustomSpanProcessor implements SpanProcessor {
    onStart(span: Span): void {
        span.setAttributes({
            "processor.name": "CustomSpanPressor"
        });
    }

    onEnd(): void {}

    forceFlush() {
        return Promise.resolve();
    }

    shutdown() {
        return Promise.resolve();
    }
}
```

```ts !#6-8 bootstrap.tsx
import { registerHoneycombInstrumentation } from "@squide/firefly-honeycomb";
import { CustomSpanProcessor } from "./CustomSpanProcessor.ts";

registerHoneycombInstrumentation(runtime, "endpoints-sample", [/.+/g,], {
    endpoint: "https://my-collector",
    spanProcessors: [
        new CustomSpanProcessor()
    ]
});
```

### Customize fetch instrumentation

To extend/replace the default [@opentelemetry/instrumentation-fetch](https://github.com/open-telemetry/opentelemetry-js/tree/main/experimental/packages/opentelemetry-instrumentation-fetch) options, provide a function returning an object literal of options. The function will receive as an argument an object literal of default options that can either be extended or ignored.

```ts !#5-10 bootstrap.tsx
import { registerHoneycombInstrumentation, defaultDefineFetchInstrumentationOptions } from "@squide/firefly-honeycomb";

registerHoneycombInstrumentation(runtime, "endpoints-sample", [/.+/g,], {
    endpoint: "https://my-collector",
    fetchInstrumentation: defaultDefineFetchInstrumentationOptions(defaultOptions => {
        return {
            ...defaultOptions,
            ignoreNetworkEvents: false
        }
    })
});
```

### Disable fetch instrumentation

```ts !#5 bootstrap.tsx
import { registerHoneycombInstrumentation } from "@squide/firefly-honeycomb";

registerHoneycombInstrumentation(runtime, "endpoints-sample", [/.+/g,], {
    endpoint: "https://my-collector",
    fetchInstrumentation: false
});
```

### Customize DOM instrumentation

To extend/replace the default [@opentelemetry/instrumentation-document-load](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/plugins/web/opentelemetry-instrumentation-document-load#document-load-instrumentation-options) options, provide a function returning an object literal of options. The function will receive as an argument an object literal of default options that can either be extended or ignored.

```ts !#5-10 bootstrap.tsx
import { registerHoneycombInstrumentation, defaultDefineDocumentLoadInstrumentationOptions } from "@squide/firefly-honeycomb";

registerHoneycombInstrumentation(runtime, "endpoints-sample", [/.+/g,], {
    endpoint: "https://my-collector",
    documentLoadInstrumentation: (defaultOptions => {
        return {
            ...defaultOptions,
            ignoreNetworkEvents: false
        }
    })
});
```

### Disable DOM instrumentation

```ts !#5 bootstrap.tsx
import { registerHoneycombInstrumentation } from "@squide/firefly-honeycomb";

registerHoneycombInstrumentation(runtime, "endpoints-sample", [/.+/g,], {
    endpoint: "https://my-collector",
    documentLoadInstrumentation: false
});
```

### Enable XHR instrumentation

By default, [@opentelemetry/instrumentation-xml-http-request](https://github.com/open-telemetry/opentelemetry-js/tree/main/experimental/packages/opentelemetry-instrumentation-xml-http-request) is disabled. To enable the instrumentation, provide a function returning an object literal of options. The function will receive as an argument an object literal of default options that can either be extended or ignored.

```ts !#5-10 bootstrap.tsx
import { registerHoneycombInstrumentation } from "@squide/firefly-honeycomb";

registerHoneycombInstrumentation(runtime, "endpoints-sample", [/.+/g,], {
    endpoint: "https://my-collector",
    xmlHttpRequestInstrumentation: (defaultOptions => {
        return {
            ...defaultOptions,
            ignoreNetworkEvents: false
        }
    })
});
```

### Enable user interactions instrumentation

By default, [@opentelemetryinstrumentation-user-interaction](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/plugins/web/opentelemetry-instrumentation-user-interaction) is disabled. To enable the instrumentation, provide a function returning an object literal of options. The function will receive as an argument an object literal of default options that can either be extended or ignored.

```ts !#5-10 bootstrap.tsx
import { registerHoneycombInstrumentation } from "@squide/firefly-honeycomb";

registerHoneycombInstrumentation(runtime, "endpoints-sample", [/.+/g,], {
    endpoint: "https://my-collector",
    userInteractionInstrumentation: (defaultOptions => {
        return {
            ...defaultOptions,
            eventNames: ["submit", "click", "keypress"]
        }
    })
});
```

## Configuration transformers

!!!warning
We do not guarantee that your configuration transformers won't break after an update. It's your responsibility to keep them up to date with new releases.
!!!

The [predefined options](#parameters) are useful to quickly customize the [default configuration](https://github.com/gsoft-inc/wl-web-configs/blob/main/packages/webpack-configs/src/dev.ts) of the [Honeycomb Web SDK](https://docs.honeycomb.io/send-data/javascript-browser/honeycomb-distribution), but only covers a subset of the [options](https://docs.honeycomb.io/send-data/javascript-browser/honeycomb-distribution/#advanced-configuration). If you need full control over the configuration, you can provide configuration transformer functions through the `transformers` option of the `registerHoneycombInstrumentation` function. Remember, **no locked in** :heart::v:.

To view the default configuration of `registerHoneycombInstrumentation`, have a look at the [registerHoneycombInstrumentation.ts](https://github.com/gsoft-inc/wl-squide/blob/main/packages/firefly-honeycomb/src/registerHoneycombInstrumentation.ts) file on GitHub.

### `transformers`

```ts
transformer(options: HoneycombSdkOptions, runtime: FireflyRuntime) => HoneycombSdkOptions;
```

```tsx !#3-7,11 bootstrap.tsx
import { registerHoneycombInstrumentation, type HoneycombSdkOptionsTransformer } from "@squide/firefly-honeycomb";

const skipOptionsValidationTransformer: HoneycombSdkOptionsTransformer = config => {
    config.skipOptionsValidation = true;

    return config;
}

registerHoneycombInstrumentation(runtime, "endpoints-sample", [/.+/g,], {
    endpoint: "https://my-collector",
    transformers: [skipOptionsValidationTransformer]
});
```

### Execution context

Generic transformers can use the `runtime` argument to gather additional information about their execution context, like the `mode` they are operating in:

```ts !#4 transformer.js
import type { HoneycombSdkOptionsTransformer } from "@squide/firefly-honeycomb";

const skipOptionsValidationTransformer: HoneycombSdkOptionsTransformer = (config, runtime) => {
    if (runtime.mode === "development") {
        config.skipOptionsValidation = true;
    }

    return config;
}
```

