import { createContext, useContext } from "react";

export interface FeatureFlags {
    featureA: boolean;
    featureB: boolean;
    featureC: boolean;
}

export const FeatureFlagsContext = createContext<FeatureFlags | undefined>(undefined);

export function useFeatureFlags() {
    return useContext(FeatureFlagsContext);
}
