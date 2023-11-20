import { isNil } from "@squide/core";
import { useI18nextPlugin } from "./useI18nextPlugin.ts";

export function useI18nextInstance(key: string) {
    const plugin = useI18nextPlugin();

    const instance = plugin.getInstance(key);

    if (isNil(instance)) {
        throw new Error(`[squide] Cannot find a registered i18next instance for key: ${key}. Did you forget to register the i18next instance with the i18nextPlugin?`);
    }

    return instance;
}
