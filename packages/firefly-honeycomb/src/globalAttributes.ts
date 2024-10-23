import type { Attributes, AttributeValue, Span } from "@opentelemetry/api";
import type { SpanProcessor } from "@opentelemetry/sdk-trace-web";

class GlobalAttributeSpanProcessor implements SpanProcessor {
    #attributes: Attributes = {};

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

    setAttribute(key: string, value: AttributeValue) {
        this.#attributes[key] = value;
    }

    setAttributes(attributes: Attributes) {
        this.#attributes = {
            ...this.#attributes,
            ...attributes
        };
    }
}

export const globalAttributeSpanProcessor = new GlobalAttributeSpanProcessor();

export function setGlobalSpanAttribute(key: string, value: AttributeValue) {
    globalAttributeSpanProcessor.setAttribute(key, value);
}

export function setGlobalSpanAttributes(attributes: Attributes) {
    globalAttributeSpanProcessor.setAttributes(attributes);
}
