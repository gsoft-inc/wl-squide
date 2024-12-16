import { createContext, useContext } from "react";

export const BackgroundColorContext = createContext<string | undefined>(undefined);

export function useBackgroundColor() {
    return useContext(BackgroundColorContext);
}
