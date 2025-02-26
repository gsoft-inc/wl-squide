import { LocalStorageAccessor, LocalStorageManager } from "@squide/fakes";
import { createContext, useContext } from "react";

export interface OgFeatureFlags {
    featureA: boolean;
    featureB: boolean;
    featureC: boolean;
}

export interface OtherFeatureFlags {
    otherA: boolean;
    otherB: boolean;
}

export type FeatureFlags = OgFeatureFlags & OtherFeatureFlags;

const DefaultFeatureFlags = {
    featureA: true,
    featureB: true,
    featureC: false,
    otherA: false,
    otherB: false
};

export class LocalStorageFeatureFlagsManager {
    readonly #localStorageManager: LocalStorageManager<FeatureFlags>;

    constructor() {
        this.#localStorageManager = new LocalStorageManager("app-feature-flags");
    }

    setFeatureFlags(featureFlags: FeatureFlags) {
        this.#localStorageManager.setObjectValue(featureFlags);
    }

    getFeatureFlags() {
        const featureFlags = this.#localStorageManager.getObjectValue();

        if (featureFlags) {
            return featureFlags;
        }

        return DefaultFeatureFlags;
    }

    clearFeatureFlags() {
        this.#localStorageManager.clearStorage();
    }
}

export class LocalStorageFeatureFlagsAccessor {
    readonly #localStorageAccessor: LocalStorageAccessor<FeatureFlags>;

    constructor() {
        this.#localStorageAccessor = new LocalStorageAccessor("app-feature-flags");
    }

    getFeatureFlags() {
        const featureFlags = this.#localStorageAccessor.getObjectValue();

        if (featureFlags) {
            return featureFlags;
        }

        return DefaultFeatureFlags;
    }
}

export const FeatureFlagsContext = createContext<FeatureFlags | undefined>(undefined);

export function useFeatureFlags() {
    return useContext(FeatureFlagsContext);
}
