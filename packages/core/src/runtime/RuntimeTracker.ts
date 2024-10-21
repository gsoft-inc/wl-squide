import type { Tracker, TrackerAddErrorOptions, TrackerAddEventOptions, TrackerAttributes, TrackerAttributeValue, TrackerError, TrackerSpan, TrackerStartSpanOptions, TrackerTimeInput } from "../tracking/tracker.ts";

export type TrackerSpanInstances = Record<string, TrackerSpan>;

export class RuntimeTrackerSpan implements TrackerSpan {
    readonly #name: string;
    readonly #instances: TrackerSpanInstances;

    constructor(name: string, instances: TrackerSpanInstances) {
        this.#name = name;
        this.#instances = instances;
    }

    get name() {
        return this.#name;
    }

    end(endTime?: TrackerTimeInput) {
        Object.values(this.#instances).forEach(x => x.end(endTime));
    }

    addEvent(name: string, options?: TrackerAddEventOptions) {
        Object.values(this.#instances).forEach(x => x.addEvent(name, options));
    }

    addError(error: TrackerError, options?: TrackerAddErrorOptions) {
        Object.values(this.#instances).forEach(x => x.addError(error, options));
    }

    setAttribute(key: string, attribute: TrackerAttributeValue) {
        Object.values(this.#instances).forEach(x => x.setAttribute(key, attribute));
    }

    setAttributes(attributes: TrackerAttributes) {
        Object.values(this.#instances).forEach(x => x.setAttributes(attributes));
    }

    startChildSpan(name: string, options?: TrackerStartSpanOptions) {
        const instances = Object.values(this.#instances).reduce((acc, x) => {
            acc[x.name] = x.startChildSpan(name, options);

            return acc;
        }, {} as TrackerSpanInstances);

        return new RuntimeTrackerSpan(name, instances);
    }

    startActiveChildSpan(name: string, options?: TrackerStartSpanOptions) {
        const instances = Object.values(this.#instances).reduce((acc, x) => {
            acc[x.name] = x.startActiveChildSpan(name, options);

            return acc;
        }, {} as TrackerSpanInstances);

        return new RuntimeTrackerSpan(name, instances);
    }

    getInstance(key: string) {
        return this.#instances[key];
    }
}

export class RuntimeTracker {
    readonly #trackers: Tracker[];

    constructor(trackers: Tracker[] = []) {
        // Filter out undefined values.
        this.#trackers = trackers.map(x => x);
    }

    startSpan(name: string, options?: TrackerStartSpanOptions) {
        const instances = this.#trackers.reduce((acc, x) => {
            acc[x.name] = x.startSpan(name, options);

            return acc;
        }, {} as TrackerSpanInstances);

        return new RuntimeTrackerSpan(name, instances);
    }

    startActiveSpan(name: string, options?: TrackerStartSpanOptions) {
        const instances = this.#trackers.reduce((acc, x) => {
            acc[x.name] = x.startActiveSpan(name, options);

            return acc;
        }, {} as TrackerSpanInstances);

        return new RuntimeTrackerSpan(name, instances);
    }

    setAttribute(key: string, value: TrackerAttributeValue) {
        this.#trackers.forEach(x => x.setAttribute(key, value));
    }

    setAttributes(attributes: TrackerAttributes) {
        this.#trackers.forEach(x => x.setAttributes(attributes));
    }

    use(names: string[]) {
        const activeTrackers = this.#trackers.filter(x => names.includes(x.name));

        return new RuntimeTracker(activeTrackers);
    }
}
