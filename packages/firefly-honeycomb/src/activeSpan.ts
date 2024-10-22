import type { Span } from "@opentelemetry/api";
import type { FetchCustomAttributeFunction } from "@opentelemetry/instrumentation-fetch";
import type { RuntimeLogger } from "@squide/core";
import { v4 as uuidv4 } from "uuid";

declare global {
    interface Window { __SQUIDE_HONEYCOMB_ACTIVE_SPAN_STACK__: ActiveSpanStack }
}

const GlobalActiveSpanStackVariableName = "__SQUIDE_HONEYCOMB_ACTIVE_SPAN_STACK__";

export type ActiveSpanId = string;

export interface ActiveSpan {
    id: ActiveSpanId;
    name: string;
    instance: Span;
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
            throw new Error("[honeycomb] Unexpected pop, the active span stack is empty.");
        }

        if (head.id !== span.id) {
            throw new Error(`[honeycomb] The active span is not the expected span. Expected to pop span with name and id "${span.name} / ${span.id}" but found "${head.name} / ${head.id}". Did you forget to end an active span?`);
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

export function registerActiveSpanStack() {
    if (window[GlobalActiveSpanStackVariableName]) {
        throw new Error(`[honeycomb] An ActiveSpanStack instance has already been registered to window.${GlobalActiveSpanStackVariableName}. Did you register the Honeycomb instrumentation twice?`);
    }

    window[GlobalActiveSpanStackVariableName] = new ActiveSpanStack();
}

function getActiveSpanStack() {
    return window[GlobalActiveSpanStackVariableName] as ActiveSpanStack;
}

function getActiveSpan() {
    const stack = getActiveSpanStack();

    if (stack) {
        return stack.peek();
    }
}

export function setActiveSpan(name: string, span: Span) {
    const activeSpan: ActiveSpan = {
        id: uuidv4(),
        name: name,
        instance: span
    };

    const stack = getActiveSpanStack();

    if (stack) {
        stack.push(activeSpan);
    }

    return activeSpan;
}

export function popActiveSpan(span: ActiveSpan) {
    const stack = getActiveSpanStack();

    if (stack) {
        stack.pop(span);
    }
}

export function createApplyCustomAttributesOnFetchSpanFunction(logger: RuntimeLogger) {
    const fct: FetchCustomAttributeFunction = (span, request, result) => {
        const activeSpan = getActiveSpan();

        if (activeSpan) {
            const context = activeSpan.instance.spanContext();

            if (context) {
                logger.debug("[honeycomb] Found a context to apply to the following fetch request: ", context, request, result);

                span.setAttribute("trace.trace_id", context.traceId);
                span.setAttribute("trace.parent_id", context.spanId);
            }
        }
    };

    return fct;
}
