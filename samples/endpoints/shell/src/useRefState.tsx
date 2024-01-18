import { RefObject, useCallback, useRef } from "react";

export function useRefState<T>(initialValue?: T): [RefObject<T | undefined>, (newValue: T) => void] {
    const valueRef = useRef<T | undefined>(initialValue);

    const setValue = useCallback((newValue: T) => {
        if (valueRef.current !== newValue) {
            valueRef.current = newValue;
        }
    }, [valueRef]);

    return [valueRef, setValue];
}
