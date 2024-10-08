import { HoneycombWebSDK } from "@honeycombio/opentelemetry-web";
import { context as otelContext, trace as otelTrace, type Span, SpanStatusCode } from "@opentelemetry/api";
import { getWebAutoInstrumentations } from "@opentelemetry/auto-instrumentations-web";
import type { SpanProcessor } from "@opentelemetry/sdk-trace-base";
import { type Runtime, Tracker, type TrackerAddErrorOptions, type TrackerAddEventOptions, type TrackerAttributes, type TrackerAttributeValue, type TrackerError, type TrackerSpan, type TrackerStartChildSpanOptions, type TrackerStartSpanOptions, type TrackerTimeInput } from "@squide/firefly";

export const UserIdTelemetryAttribute = "app.user_id";
export const UserPreferredLanguageTelemetryAttribute = "app.user_prefered_language";

export class HoneycombTrackerSpan implements TrackerSpan {
    readonly #span: Span;

    constructor(span: Span) {
        this.#span = span;
    }

    end(endTime?: TrackerTimeInput) {
        this.#span.end(endTime);
    }

    addEvent(name: string, options: TrackerAddEventOptions = {}) {
        const { startTime, attributes } = options;

        this.#span.addEvent(name, attributes, startTime);
    }

    addError(error: TrackerError, options: TrackerAddErrorOptions = {}) {
        const { time } = options;

        this.#span.recordException(error, time);

        this.#span.setStatus({
            code: SpanStatusCode.ERROR
        });
    }

    setAttribute(key: string, attribute: TrackerAttributeValue) {
        this.#span.setAttribute(key, attribute);
    }

    setAttributes(attributes: TrackerAttributes) {
        this.#span.setAttributes(attributes);
    }

    get originalSpan() {
        return this.#span;
    }
}

class TrackerAttributesSpanProcessor implements SpanProcessor {
    #attributes: TrackerAttributes = {};

    onStart(span: Span) {
        if (Object.keys(this.#attributes).length > 0) {
            span.setAttributes(this.#attributes);
        }
    }

    onEnd() {}

    forceFlush() {
        return Promise.resolve();
    }

    shutdown() {
        return Promise.resolve();
    }

    setAttribute(key: string, value: TrackerAttributeValue) {
        this.#attributes[key] = value;
    }

    setAttributes(attributes: TrackerAttributes) {
        this.#attributes = {
            ...this.#attributes,
            ...attributes
        };
    }
}

export interface HoneycombTrackerOptions {
    endpoint?: string;
    apiKey?: string;
    debug?: boolean;
}

export class HoneycombTracker extends Tracker {
    #trackerAttributedSpanProcessor?: TrackerAttributesSpanProcessor;

    // TODO: add a namespace attribute? https://workleap.slack.com/archives/C02E9KPRQ7P/p1727440515594139
    constructor(runtime: Runtime, serviceName: string, apiServiceUrls: RegExp[], options: HoneycombTrackerOptions = {}) {
        super(HoneycombTracker.name, runtime);

        options.debug = options.debug ?? runtime.mode === "development";

        this.#initialize(serviceName, apiServiceUrls, options);
    }

    #initialize(serviceName: string, apiServiceUrls: RegExp[], options: HoneycombTrackerOptions) {
        const { endpoint, apiKey, debug } = options;

        if (!endpoint && !apiKey) {
            throw new Error("[Honeycomb] The tracker must be initialized with either an \"endpoint\" or \"apiKey\" option.");
        }

        this.#trackerAttributedSpanProcessor = new TrackerAttributesSpanProcessor();

        const instrumentationOptions = {
            ignoreNetworkEvents: true,
            propagateTraceHeaderCorsUrls: apiServiceUrls
        };

        const instance = new HoneycombWebSDK({
            endpoint: endpoint,
            apiKey,
            debug,
            serviceName,
            instrumentations: [getWebAutoInstrumentations({
                "@opentelemetry/instrumentation-fetch": instrumentationOptions,
                "@opentelemetry/instrumentation-document-load": instrumentationOptions
            })],
            spanProcessors: [this.#trackerAttributedSpanProcessor]
        });

        instance.start();
    }

    startSpan(name: string, options: TrackerStartSpanOptions = {}) {
        const { startTime, attributes } = options;

        const span = this.tracer.startSpan(name, {
            startTime,
            attributes
        });

        return Promise.resolve(new HoneycombTrackerSpan(span));
    }

    startChildSpan(name: string, parent: HoneycombTrackerSpan, options: TrackerStartChildSpanOptions = {}) {
        const { startTime, attributes } = options;

        const context = otelTrace.setSpan(
            otelContext.active(),
            parent.originalSpan
        );

        const span = this.tracer.startSpan(name, {
            startTime,
            attributes
        }, context);

        return Promise.resolve(new HoneycombTrackerSpan(span));
    }

    setAttribute(key: string, value: TrackerAttributeValue) {
        if (this.#trackerAttributedSpanProcessor) {
            this.#trackerAttributedSpanProcessor.setAttribute(key, value);
        }
    }

    setAttributes(attributes: TrackerAttributes) {
        if (this.#trackerAttributedSpanProcessor) {
            this.#trackerAttributedSpanProcessor.setAttributes(attributes);
        }
    }

    get tracer() {
        // The tracer name is used as the "library.name" attribute.
        return otelTrace.getTracer("endpoints-shared");
    }
}
