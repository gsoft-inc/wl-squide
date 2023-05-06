import { createContext, useContext } from "react";

import { isNil } from "../shared/assertions.ts";

export const RuntimeContext = createContext<unknown | undefined>(undefined);

export function useRuntime() {
    const runtime = useContext(RuntimeContext);

    if (isNil(runtime)) {
        throw new Error("[squide] useRuntime() is called before a Runtime instance has been provided.");
    }

    return runtime;
}
