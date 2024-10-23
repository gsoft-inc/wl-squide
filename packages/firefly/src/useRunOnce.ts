import { useEffect, useRef } from "react";

// A special hook to use for code that should be protected from
// React strict mode rendering useEffect hook twice when in development.
export function useRunOnce(fct: () => void) {
    const triggered = useRef(false);

    useEffect(() => {
        if (!triggered.current) {
            triggered.current = true;

            fct();
        }
    }, [fct]);
}
