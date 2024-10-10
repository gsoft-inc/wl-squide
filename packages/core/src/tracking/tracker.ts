import type { Runtime } from "../runtime/runtime.ts";

export type TrackerAttributeValue = string | number | boolean | Array<null | undefined | string> | Array<null | undefined | number> | Array<null | undefined | boolean>;

export type TrackerAttributes = Record<string, TrackerAttributeValue | undefined>;

export type TrackerTimeInput = number | Date;

export interface TrackerAddEventOptions {
    startTime?: TrackerTimeInput;
    attributes?: TrackerAttributes;
}

export interface TrackerAddErrorOptions {
    time?: TrackerTimeInput;
}

export interface TrackerExceptionWithCode {
    code: string | number;
    name?: string;
    message?: string;
    stack?: string;
}

export interface TrackerExceptionWithMessage {
    code?: string | number;
    message: string;
    name?: string;
    stack?: string;
}

export interface TrackerExceptionWithName {
    code?: string | number;
    message?: string;
    name: string;
    stack?: string;
}

export type TrackerError = TrackerExceptionWithCode | TrackerExceptionWithMessage | TrackerExceptionWithName;

export interface TrackerSpan {
    end: (endTime?: TrackerTimeInput) => void;
    addEvent: (name: string, options?: TrackerAddEventOptions) => void;
    addError: (error: TrackerError, options?: TrackerAddErrorOptions) => void;
    setAttribute: (key: string, attribute: TrackerAttributeValue) => void;
    setAttributes: (attributes: TrackerAttributes) => void;
}

export interface TrackerStartSpanOptions {
    startTime?: TrackerTimeInput;
    attributes?: TrackerAttributes;
}

export interface TrackerStartChildSpanOptions {
    startTime?: TrackerTimeInput;
    attributes?: TrackerAttributes;
}

export abstract class Tracker {
    readonly #name: string;
    protected readonly _runtime: Runtime;

    constructor(name: string, runtime: Runtime) {
        this.#name = name;
        this._runtime = runtime;
    }

    get name() {
        return this.#name;
    }

    abstract startSpan(name: string, options?: TrackerStartSpanOptions): TrackerSpan;
    abstract startChildSpan(name: string, parent: TrackerSpan, options?: TrackerStartChildSpanOptions): TrackerSpan;
    abstract setAttribute(key: string, value: TrackerAttributeValue): void;
    abstract setAttributes(attributes: TrackerAttributes): void;
}
