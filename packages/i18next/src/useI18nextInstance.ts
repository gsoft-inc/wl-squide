import { useI18nextPlugin } from "./useI18nextPlugin.ts";

export function useI18nextInstance(key: string) {
    const plugin = useI18nextPlugin();

    return plugin.getInstance(key);
}
