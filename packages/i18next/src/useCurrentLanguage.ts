import { useI18nextPlugin } from "./useI18nextPlugin.ts";

export function useCurrentLanguage() {
    const plugin = useI18nextPlugin();

    return plugin.currentLanguage;
}
