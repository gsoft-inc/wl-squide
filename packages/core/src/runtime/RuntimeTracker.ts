import type { Tracker, TrackerAddErrorOptions, TrackerAddEventOptions, TrackerAttributes, TrackerAttributeValue, TrackerError, TrackerSpan, TrackerStartChildSpanOptions, TrackerStartSpanOptions, TrackerTimeInput } from "../tracking/tracker.ts";

export type TrackerSpanInstances = Record<string, TrackerSpan>;

export class RuntimeTrackerSpan implements TrackerSpan {
    readonly #instances: TrackerSpanInstances;

    constructor(instances: TrackerSpanInstances) {
        this.#instances = instances;
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

    async startSpan(name: string, options?: TrackerStartSpanOptions) {
        // Resolve the promises first because Array.reduce and promises requires weird typings.
        // View https://j5cookie.medium.com/async-array-reduce-in-typescript-e116ba1f3578.
        const instances = await Promise.all(this.#trackers.map(async x => ({
            name: x.name,
            span: await x.startSpan(name, options)
        })));

        const asObject = instances.reduce((acc, x) => {
            acc[x.name] = x.span;

            return acc;
        }, {} as TrackerSpanInstances);

        return new RuntimeTrackerSpan(asObject);
    }

    async startChildSpan(name: string, parent: RuntimeTrackerSpan, options?: TrackerStartChildSpanOptions) {
        // Resolve the promises first because Array.reduce and promises requires weird typings.
        // View https://j5cookie.medium.com/async-array-reduce-in-typescript-e116ba1f3578.
        const instances = await Promise.all(this.#trackers.map(async x => {
            const parentInstance = parent.getInstance(x.name);

            if (!parentInstance) {
                throw new Error(`[squide] Cannot start child span "${name}" because no parent instance for tracker ${x.name} has been registered. Did you start the parent span for the same tracker?`);
            }

            return {
                name: x.name,
                span: await x.startChildSpan(name, parentInstance, options)
            };
        }));

        const asObject = instances.reduce((acc, x) => {
            acc[x.name] = x.span;

            return acc;
        }, {} as TrackerSpanInstances);

        return new RuntimeTrackerSpan(asObject);
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
