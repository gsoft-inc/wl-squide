import { context, trace, type Span, SpanStatusCode, type Tracer } from "@opentelemetry/api";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { WebTracerProvider, BatchSpanProcessor } from "@opentelemetry/sdk-trace-web";
import { ZoneContextManager } from "@opentelemetry/context-zone";
import { Resource } from "@opentelemetry/resources";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";

import { XMLHttpRequestInstrumentation } from "@opentelemetry/instrumentation-xml-http-request";
import { FetchInstrumentation } from "@opentelemetry/instrumentation-fetch";
import { registerInstrumentations } from "@opentelemetry/instrumentation";


declare const window: Window;
let provider: WebTracerProvider | undefined;
let bindingSpan: Span | undefined;
let tracer: Tracer | undefined;

function setProvider(endpointUrl: string, serviceName: string) {
    if (provider !== undefined) {
        throw new Error("OpenTelemetry has already been initialized");
    }

    const exporter = new OTLPTraceExporter({
        url: `https://${endpointUrl}:443/v1/traces`
    });

    provider = new WebTracerProvider({
        resource: new Resource({
            [SemanticResourceAttributes.SERVICE_NAME]: serviceName
        })
    });

    // Batching the spans is recommended by Honeycomb
    provider.addSpanProcessor(new BatchSpanProcessor(exporter));
    provider.register({
        contextManager: new ZoneContextManager()
    });
}

function setTracking(backendUrlRegex: RegExp, trackRequest: boolean, trackFetch: boolean) {
    const instrumentations = [];

    if (trackRequest) {
        instrumentations.push(new XMLHttpRequestInstrumentation({
            propagateTraceHeaderCorsUrls: [
                backendUrlRegex
            ]
        }));
    }

    if (trackFetch) {
        instrumentations.push(new FetchInstrumentation({
            propagateTraceHeaderCorsUrls: [
                backendUrlRegex
            ]
        }));
    }

    if (instrumentations.length === 0) {
        return;
    }

    registerInstrumentations({
        instrumentations
    });
}

function trackWindowsEvents() {
    if (!tracer) {
        return;
    }

    tracer.startActiveSpan("document_load", span => {
        //start span when navigating to page
        span.setAttribute("pageUrlWindow", window.location.href); // Todo find the naming convention for attributes
        window.onload = event => {
            // ... do loading things
            // ... attach timing information
            span.end(); //once page is loaded, end the span
        };
    });
}

export interface TracingOptions {
    endpointUrl: string;
    backendUrlRegex: RegExp;
    serviceName?: string;
    trackRequest?: boolean;
    trackFetch?: boolean;
}

export function initTracing({ endpointUrl, backendUrlRegex, serviceName = "browser", trackRequest = false, trackFetch = false }: TracingOptions) {
    setProvider(endpointUrl, serviceName);

    setTracking(backendUrlRegex, trackRequest, trackFetch);

    tracer = trace.getTracer(serviceName);

    trackWindowsEvents();
}

// from https://github.com/SigNoz/sample-reactjs-app/tree/master
export function traceSpan<F extends (...args: unknown[]) => ReturnType<F>>(
    name: string,
    func: F
): ReturnType<F> {
    if (!tracer) {
        return func();
    }

    let singleSpan: Span;
    if (bindingSpan) {
        const ctx = trace.setSpan(context.active(), bindingSpan);
        singleSpan = tracer.startSpan(name, undefined, ctx);
        bindingSpan = undefined;
    } else {
        singleSpan = tracer.startSpan(name);
    }

    return context.with(trace.setSpan(context.active(), singleSpan), () => {
        try {
            const result = func();
            singleSpan.end();

            return result;
        } catch (error: unknown) {
            singleSpan.setStatus({ code: SpanStatusCode.ERROR });
            singleSpan.end();
            throw error;
        }
    });
}
