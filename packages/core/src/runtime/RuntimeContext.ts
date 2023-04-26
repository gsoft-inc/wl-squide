import { createContext, useContext } from "react";

import type { Runtime } from "./runtime";

export const RuntimeContext = createContext<Runtime | undefined>(undefined);

export function useRuntime() {
    return useContext(RuntimeContext);
}
