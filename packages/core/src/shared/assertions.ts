export function isNull(value: unknown): value is null {
    return value == null;
}

export function isUndefined(value: unknown): value is undefined {
    return typeof value === "undefined" || value === undefined;
}

export function isDefined(value: unknown) {
    return typeof value !== "undefined" && value !== undefined;
}

export function isNil(value: unknown): value is null | undefined {
    return isNull(value) || isUndefined(value);
}

export function isNilOrEmpty(value: unknown): value is null | undefined | "" {
    return isNil(value) || value === "";
}

export function isFunction(value: unknown): value is (...args: unknown[]) => unknown {
    return typeof value === "function";
}

