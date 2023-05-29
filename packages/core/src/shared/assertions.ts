/**
 * @internal
 */
export function isNull(value: unknown): value is null {
    return value == null;
}

/**
 * @internal
 */
export function isUndefined(value: unknown): value is undefined {
    return typeof value === "undefined" || value === undefined;
}

/**
 * @internal
 */
export function isDefined(value: unknown) {
    return typeof value !== "undefined" && value !== undefined;
}

/**
 * @internal
 */
export function isNil(value: unknown): value is null | undefined {
    return isNull(value) || isUndefined(value);
}

/**
 * @internal
 */
export function isNilOrEmpty(value: unknown): value is null | undefined | "" {
    return isNil(value) || value === "";
}
