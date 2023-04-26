import { createContext, useContext } from "react";

import type { Runtime } from "./runtime.ts";

export const RuntimeContext = createContext<Runtime | undefined>(undefined);

export function useRuntime() {
    return useContext(RuntimeContext);
}
