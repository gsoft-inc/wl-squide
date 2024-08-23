import { isFunction } from "../shared/assertions.ts";
import type { DeferredRegistrationFunction } from "./registerModule.ts";

export function mergeDeferredRegistrations<TData>(candidates: (DeferredRegistrationFunction<TData> | void)[]) {
    const deferredRegistrations = candidates.filter(x => isFunction(x)) as DeferredRegistrationFunction<TData>[];

    if (deferredRegistrations.length === 0) {
        return;
    }

    if (deferredRegistrations.length === 1) {
        return deferredRegistrations[0];
    }

    const mergeFunction: DeferredRegistrationFunction<TData> = async (data, state) => {
        for (const x of deferredRegistrations) {
            await x(data, state);
        }
    };

    return mergeFunction;
}
