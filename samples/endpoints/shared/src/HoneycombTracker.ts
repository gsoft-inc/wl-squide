import { HoneycombWebSDK } from "@honeycombio/opentelemetry-web";
import { type Context, trace as otelTrace, ROOT_CONTEXT, type Span, SpanKind, SpanStatusCode } from "@opentelemetry/api";
import { getWebAutoInstrumentations } from "@opentelemetry/auto-instrumentations-web";
import type { FetchCustomAttributeFunction } from "@opentelemetry/instrumentation-fetch";
import type { SpanProcessor } from "@opentelemetry/sdk-trace-base";
import { type Runtime, type RuntimeLogger, Tracker, type TrackerAddErrorOptions, type TrackerAddEventOptions, type TrackerAttributes, type TrackerAttributeValue, type TrackerError, type TrackerSpan, type TrackerStartSpanOptions, type TrackerTimeInput } from "@squide/firefly";
import { v4 as uuidv4 } from "uuid";

export const TracerName = "@squide/honeycomb";

export const UserIdTelemetryAttribute = "app.user_id";
export const UserPreferredLanguageTelemetryAttribute = "app.user_prefered_language";

class TrackerAttributeSpanProcessor implements SpanProcessor {
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

const GlobalActiveSpanStackVariableName = "__HONEYCOMB_TRACKER_ACTIVE_SPAN_STACK__";

type ActiveSpanId = string;

interface ActiveSpan {
    id: ActiveSpanId;
    name: string;
    span: Span;
}

// https://github.com/open-telemetry/opentelemetry-js/issues/3558
// https://github.com/open-telemetry/opentelemetry-js/issues/3558#issuecomment-1760680244
class ActiveSpanStack {
    readonly #stack: ActiveSpan[] = [];

    push(span: ActiveSpan) {
        this.#stack.push(span);
    }

    pop(span: ActiveSpan) {
        const head = this.#stack.pop();

        if (!head) {
            throw new Error("[honeycomb-tracker] Unexpected pop, the active span stack is empty.");
        }

        if (head.id !== span.id) {
            throw new Error(`[honeycomb-tracker] The active span is not the expected span. Expected to pop span with name and id "${span.name} / ${span.id}" but found "${head.name} / ${head.id}". Did you forget to end an active span?`);
        }

        return head;
    }

    peek() {
        if (this.#stack.length === 0) {
            return undefined;
        }

        return this.#stack[this.#stack.length - 1];
    }
}

function isActiveSpanStackRegistered() {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return !!window[GlobalActiveSpanStackVariableName];
}

function registerActiveSpanStack() {
    if (isActiveSpanStackRegistered()) {
        throw new Error(`[honeycomb-tracker] An ActiveSpanStack instance has already been registered to window.${GlobalActiveSpanStackVariableName}.`);
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window[GlobalActiveSpanStackVariableName] = new ActiveSpanStack();
}

function removeActiveSpanStack() {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window[GlobalActiveSpanStackVariableName] = undefined;
}

function getActiveSpanStack() {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const stack = window[GlobalActiveSpanStackVariableName];

    return stack as ActiveSpanStack;
}

function getActiveSpan() {
    const stack = getActiveSpanStack();

    if (stack) {
        return stack.peek();
    }
}

function setActiveSpan(span: ActiveSpan) {
    const stack = getActiveSpanStack();

    if (stack) {
        stack.push(span);
    }
}

function endActiveSpan(span: ActiveSpan) {
    const stack = getActiveSpanStack();

    if (stack) {
        stack.pop(span);
    }
}

function createActiveSpanId() {
    return uuidv4();
}

function createApplyCustomAttributesOnFetchSpanFunction(logger: RuntimeLogger) {
    const fct: FetchCustomAttributeFunction = (span, request, result) => {
        const activeSpan = getActiveSpan();

        if (activeSpan) {
            const context = activeSpan.span.spanContext();

            if (context) {
                logger.debug("[honeycomb-tracker] Found a context to apply for the following Fetch Request traced by an automatic instrumentation Span: ", context, request, result);

                span.setAttribute("trace.trace_id", context.traceId);
                span.setAttribute("trace.parent_id", context.spanId);
            }
        }
    };

    return fct;
}

interface HoneycombTrackerStartSpanOptions extends TrackerStartSpanOptions {
    context?: Context;
}

function getTracer() {
    // The tracer name is used as the "library.name" attribute.
    return otelTrace.getTracer(TracerName);
}

function createTrackerSpan(name: string, options: HoneycombTrackerStartSpanOptions = {}) {
    const { startTime, attributes, context } = options;

    const span = getTracer().startSpan(name, {
        kind: SpanKind.CLIENT,
        startTime,
        attributes
    }, context);

    return new HoneycombTrackerSpan(name, span);
}

function createTrackerActiveSpan(name: string, options: HoneycombTrackerStartSpanOptions = {}) {
    const { startTime, attributes, context } = options;

    const span = getTracer().startSpan(name, {
        kind: SpanKind.CLIENT,
        startTime,
        attributes
    }, context);

    const id = createActiveSpanId();

    setActiveSpan({
        id,
        name,
        span
    });

    return new HoneycombTrackerActiveSpan(id, name, span);
}

export class HoneycombTrackerSpan implements TrackerSpan {
    readonly _name: string;
    readonly _span: Span;

    constructor(name: string, span: Span) {
        this._name = name;
        this._span = span;
    }

    get name() {
        return this._name;
    }

    end(endTime?: TrackerTimeInput) {
        this._span.end(endTime);
    }

    addEvent(name: string, options: TrackerAddEventOptions = {}) {
        const { startTime, attributes } = options;

        this._span.addEvent(name, attributes, startTime);
    }

    addError(error: TrackerError, options: TrackerAddErrorOptions = {}) {
        const { time } = options;

        this._span.recordException(error, time);

        this._span.setStatus({
            code: SpanStatusCode.ERROR
        });
    }

    setAttribute(key: string, attribute: TrackerAttributeValue) {
        this._span.setAttribute(key, attribute);
    }

    setAttributes(attributes: TrackerAttributes) {
        this._span.setAttributes(attributes);
    }

    startChildSpan(name: string, options: TrackerStartSpanOptions = {}) {
        const context = otelTrace.setSpan(ROOT_CONTEXT, this._span);

        return createTrackerSpan(name, {
            ...options,
            context
        });
    }

    startActiveChildSpan(name: string, options: TrackerStartSpanOptions = {}) {
        const context = otelTrace.setSpan(ROOT_CONTEXT, this._span);

        return createTrackerActiveSpan(name, {
            ...options,
            context
        });
    }

    get originalSpan() {
        return this._span;
    }
}

export class HoneycombTrackerActiveSpan extends HoneycombTrackerSpan {
    readonly #id: ActiveSpanId;

    constructor(id: ActiveSpanId, name: string, span: Span) {
        super(name, span);

        this.#id = id;
    }

    get id() {
        return this.#id;
    }

    override end(endTime?: TrackerTimeInput) {
        super.end(endTime);

        endActiveSpan({
            id: this.#id,
            name: this._name,
            span: this._span
        });
    }
}

export interface HoneycombTrackerOptions {
    endpoint?: string;
    apiKey?: string;
    debug?: boolean;
}

export class HoneycombTracker extends Tracker {
    #instance?: HoneycombWebSDK;
    #trackerAttributedSpanProcessor?: TrackerAttributeSpanProcessor;

    // TODO: add a namespace attribute? https://workleap.slack.com/archives/C02E9KPRQ7P/p1727440515594139
    constructor(runtime: Runtime, serviceName: string, apiServiceUrls: RegExp[], options: HoneycombTrackerOptions = {}) {
        super(HoneycombTracker.name, runtime);

        // Defaults to the runtime mode.
        options.debug = options.debug ?? runtime.mode === "development";

        this.#initialize(serviceName, apiServiceUrls, options);
    }

    #initialize(serviceName: string, apiServiceUrls: RegExp[], options: HoneycombTrackerOptions) {
        if (isActiveSpanStackRegistered()) {
            throw new Error("[honeycomb-tracker] Only one HoneycombTracker instance can be initialized. Dispose of any previous instances using the \"dispose\" method.");
        }

        const { endpoint, apiKey, debug } = options;

        if (!endpoint && !apiKey) {
            throw new Error("[honeycomb-tracker] The tracker must be initialized with either an \"endpoint\" or \"apiKey\" option.");
        }

        this.#trackerAttributedSpanProcessor = new TrackerAttributeSpanProcessor();

        const instrumentationOptions = {
            ignoreNetworkEvents: true,
            propagateTraceHeaderCorsUrls: apiServiceUrls
        };

        this.#instance = new HoneycombWebSDK({
            endpoint: endpoint,
            apiKey,
            debug,
            localVisualizations: debug,
            serviceName,
            instrumentations: [getWebAutoInstrumentations({
                "@opentelemetry/instrumentation-fetch": {
                    ...instrumentationOptions,
                    applyCustomAttributesOnSpan: createApplyCustomAttributesOnFetchSpanFunction(this._runtime.logger)
                },
                "@opentelemetry/instrumentation-document-load": instrumentationOptions
            })],
            spanProcessors: [this.#trackerAttributedSpanProcessor]
        });

        this.#instance.start();

        registerActiveSpanStack();
    }

    dispose() {
        this.#instance?.shutdown();

        removeActiveSpanStack();
    }

    startSpan(name: string, options?: TrackerStartSpanOptions) {
        return createTrackerSpan(name, options);
    }

    startActiveSpan(name: string, options?: TrackerStartSpanOptions) {
        return createTrackerActiveSpan(name, options);
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
}
