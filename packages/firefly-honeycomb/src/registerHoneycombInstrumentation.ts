/*
TODO:

- Add configuration transformers
- The protected data ready event is not traced

*/

import { HoneycombWebSDK } from "@honeycombio/opentelemetry-web";
import type { Span } from "@opentelemetry/api";
import { getWebAutoInstrumentations } from "@opentelemetry/auto-instrumentations-web";
import type { PropagateTraceHeaderCorsUrls } from "@opentelemetry/sdk-trace-web";
import {
    ApplicationBoostrappedEvent,
    ApplicationBootstrappingStartedEvent,
    LocalModuleDeferredRegistrationCompletedEvent,
    LocalModuleDeferredRegistrationFailedEvent,
    LocalModuleDeferredRegistrationStartedEvent,
    LocalModuleRegistrationCompletedEvent,
    LocalModuleRegistrationFailedEvent,
    LocalModuleRegistrationStartedEvent,
    ModulesReadyEvent,
    ModulesRegisteredEvent,
    MswReadyEvent,
    ProtectedDataFetchStartedEvent,
    ProtectedDataReadyEvent,
    PublicDataFetchStartedEvent,
    PublicDataReadyEvent,
    RemoteModuleDeferredRegistrationCompletedEvent,
    RemoteModuleDeferredRegistrationFailedEvent,
    RemoteModuleDeferredRegistrationStartedEvent,
    RemoteModuleRegistrationCompletedEvent,
    RemoteModuleRegistrationFailedEvent,
    RemoteModuleRegistrationStartedEvent,
    type FireflyRuntime,
    type LocalModuleDeferredRegistrationStartedEventPayload,
    type LocalModuleRegistrationStartedEventPayload,
    type RemoteModuleDeferredRegistrationStartedEventPayload,
    type RemoteModuleRegistrationStartedEventPayload
} from "@squide/firefly";
import { globalAttributeSpanProcessor } from "./GlobalAttributeSpanProcessor.ts";
import { createApplyCustomAttributesOnFetchSpanFunction, registerActiveSpanStack, type ActiveSpan } from "./activeSpan.ts";
import { getTracer } from "./tracer.ts";
import { endActiveSpan, startActiveChildSpan, startChildSpan, startSpan, traceError } from "./utils.ts";

type HoneycombSdkOptions = NonNullable<ConstructorParameters<typeof HoneycombWebSDK>[number]>;

/*
TODO:

- Add custom span processors
- Add custom instrumentations
- Add fetch and document load options
*/

export interface RegisterHoneycombInstrumentationOptions {
    endpoint?: HoneycombSdkOptions["endpoint"];
    apiKey?: HoneycombSdkOptions["apiKey"];
    debug?: HoneycombSdkOptions["debug"];
    serviceName?: HoneycombSdkOptions["serviceName"];
}

export function registerHoneycombInstrumentation(runtime: FireflyRuntime, serviceName: NonNullable<HoneycombSdkOptions["serviceName"]>, apiServiceUrls: PropagateTraceHeaderCorsUrls, options: RegisterHoneycombInstrumentationOptions = {}) {
    const {
        endpoint,
        apiKey,
        debug: debugValue
    } = options;

    // Defaults to the runtime mode.
    const debug = debugValue ?? runtime.mode === "development";

    if (!endpoint && !apiKey) {
        throw new Error("[honeycomb] Honeycomb instrumentation must be initialized with either an \"endpoint\" or \"apiKey\" option.");
    }

    const instrumentationOptions = {
        ignoreNetworkEvents: true,
        propagateTraceHeaderCorsUrls: apiServiceUrls
    };

    const instance = new HoneycombWebSDK({
        endpoint: endpoint,
        apiKey,
        debug,
        localVisualizations: debug,
        serviceName,
        instrumentations: [getWebAutoInstrumentations({
            "@opentelemetry/instrumentation-fetch": {
                ...instrumentationOptions,
                applyCustomAttributesOnSpan: createApplyCustomAttributesOnFetchSpanFunction(runtime.logger)
            },
            "@opentelemetry/instrumentation-document-load": instrumentationOptions
        })],
        spanProcessors: [globalAttributeSpanProcessor]
    });

    instance.start();

    registerTrackingListeners(runtime);
    registerActiveSpanStack();
}

type DataFetchState = "none" | "fetching-data" | "public-data-ready" | "protected-data-ready" | "data-ready";

function reduceDataFetchEvents(runtime: FireflyRuntime, onDataFetchingStarted: () => void, onDataReady: () => void) {
    let dataFetchState: DataFetchState = "none";

    runtime.eventBus.addListener(PublicDataFetchStartedEvent, () => {
        if (dataFetchState === "none") {
            dataFetchState = "fetching-data";

            onDataFetchingStarted();
        }
    });

    runtime.eventBus.addListener(PublicDataReadyEvent, () => {
        if (dataFetchState === "fetching-data") {
            dataFetchState = "public-data-ready";
        } else if (dataFetchState === "protected-data-ready") {
            dataFetchState = "data-ready";

            onDataReady();
        }
    });

    runtime.eventBus.addListener(ProtectedDataFetchStartedEvent, () => {
        if (dataFetchState === "none") {
            dataFetchState = "fetching-data";

            onDataFetchingStarted();
        }
    });

    runtime.eventBus.addListener(ProtectedDataReadyEvent, () => {
        if (dataFetchState === "fetching-data") {
            dataFetchState = "protected-data-ready";
        } else if (dataFetchState === "public-data-ready") {
            dataFetchState = "data-ready";

            onDataReady();
        }
    });
}

function registerTrackingListeners(runtime: FireflyRuntime) {
    let bootstrappingSpan: Span;
    let localModuleRegistrationSpan: Span;
    let localModuleDeferredRegistrationSpan: Span;
    let remoteModuleRegistrationSpan: Span;
    let remoteModuleDeferredRegistrationSpan: Span;
    let dataFetchSpan: ActiveSpan;

    runtime.eventBus.addListener(ApplicationBootstrappingStartedEvent, () => {
        bootstrappingSpan = startSpan((options, context) => getTracer().startSpan("squide-boostrapping", options, context));
    });

    runtime.eventBus.addListener(ApplicationBoostrappedEvent, () => {
        if (bootstrappingSpan) {
            bootstrappingSpan.end();
        }
    });

    runtime.eventBus.addListener(LocalModuleRegistrationStartedEvent, (payload: unknown) => {
        localModuleRegistrationSpan = startChildSpan(bootstrappingSpan, (options, context) => getTracer().startSpan("local-module-registration", {
            ...options,
            attributes: {
                "squide.module_count": (payload as LocalModuleRegistrationStartedEventPayload).moduleCount
            }
        }, context));
    });

    runtime.eventBus.addListener(LocalModuleRegistrationCompletedEvent, () => {
        if (localModuleRegistrationSpan) {
            localModuleRegistrationSpan.end();
        }
    });

    runtime.eventBus.addListener(LocalModuleRegistrationFailedEvent, (payload: unknown) => {
        if (localModuleRegistrationSpan) {
            traceError(localModuleRegistrationSpan, payload as Error);
        }
    });

    runtime.eventBus.addListener(LocalModuleDeferredRegistrationStartedEvent, (payload: unknown) => {
        localModuleDeferredRegistrationSpan = startChildSpan(bootstrappingSpan, (options, context) => getTracer().startSpan("local-module-deferred-registration", {
            ...options,
            attributes: {
                "squide.registration_count": (payload as LocalModuleDeferredRegistrationStartedEventPayload).registrationCount
            }
        }, context));
    });

    runtime.eventBus.addListener(LocalModuleDeferredRegistrationCompletedEvent, () => {
        if (localModuleDeferredRegistrationSpan) {
            localModuleDeferredRegistrationSpan.end();
        }
    });

    runtime.eventBus.addListener(LocalModuleDeferredRegistrationFailedEvent, (payload: unknown) => {
        if (localModuleDeferredRegistrationSpan) {
            traceError(localModuleRegistrationSpan, payload as Error);
        }
    });

    runtime.eventBus.addListener(RemoteModuleRegistrationStartedEvent, (payload: unknown) => {
        remoteModuleRegistrationSpan = startChildSpan(bootstrappingSpan, (options, context) => getTracer().startSpan("remote-module-registration", {
            ...options,
            attributes: {
                "squide.remote_count": (payload as RemoteModuleRegistrationStartedEventPayload).remoteCount
            }
        }, context));
    });

    runtime.eventBus.addListener(RemoteModuleRegistrationCompletedEvent, () => {
        if (remoteModuleRegistrationSpan) {
            remoteModuleRegistrationSpan.end();
        }
    });

    runtime.eventBus.addListener(RemoteModuleRegistrationFailedEvent, (payload: unknown) => {
        if (remoteModuleRegistrationSpan) {
            traceError(remoteModuleRegistrationSpan, payload as Error);
        }
    });

    runtime.eventBus.addListener(RemoteModuleDeferredRegistrationStartedEvent, (payload: unknown) => {
        remoteModuleDeferredRegistrationSpan = startChildSpan(bootstrappingSpan, (options, context) => getTracer().startSpan("remote-module-deferred-registration", {
            ...options,
            attributes: {
                "squide.registration_count": (payload as RemoteModuleDeferredRegistrationStartedEventPayload).registrationCount
            }
        }, context));
    });

    runtime.eventBus.addListener(RemoteModuleDeferredRegistrationCompletedEvent, () => {
        if (remoteModuleDeferredRegistrationSpan) {
            remoteModuleDeferredRegistrationSpan.end();
        }
    });

    runtime.eventBus.addListener(RemoteModuleDeferredRegistrationFailedEvent, (payload: unknown) => {
        if (remoteModuleDeferredRegistrationSpan) {
            traceError(remoteModuleDeferredRegistrationSpan, payload as Error);
        }
    });

    const handleFetchDataStarted = () => {
        dataFetchSpan = startActiveChildSpan(bootstrappingSpan, (options, context) => {
            const name = "data-fetch";
            const span = getTracer().startSpan(name, options, context);

            return {
                name,
                span
            };
        });
    };

    const handleDataReady = () => {
        if (dataFetchSpan) {
            endActiveSpan(dataFetchSpan);
        }
    };

    reduceDataFetchEvents(runtime, handleFetchDataStarted, handleDataReady);

    runtime.eventBus.addListener(PublicDataFetchStartedEvent, () => {
        if (dataFetchSpan) {
            dataFetchSpan.instance.addEvent("public-data-fetch-started");
        }
    });

    runtime.eventBus.addListener(PublicDataReadyEvent, () => {
        if (dataFetchSpan) {
            dataFetchSpan.instance.addEvent("public-data-ready");
        }
    });

    runtime.eventBus.addListener(ProtectedDataFetchStartedEvent, () => {
        if (dataFetchSpan) {
            dataFetchSpan.instance.addEvent("protected-data-fetch-started");
        }
    });

    runtime.eventBus.addListener(ProtectedDataReadyEvent, () => {
        if (dataFetchSpan) {
            dataFetchSpan.instance.addEvent("protected-data-ready");
        }
    });

    runtime.eventBus.addListener(ModulesRegisteredEvent, () => {
        bootstrappingSpan.addEvent("modules-registered");
    });

    runtime.eventBus.addListener(ModulesReadyEvent, () => {
        bootstrappingSpan.addEvent("modules-ready");
    });

    runtime.eventBus.addListener(MswReadyEvent, () => {
        bootstrappingSpan.addEvent("msw-ready");
    });
}
