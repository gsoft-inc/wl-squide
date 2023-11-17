import type { LanguageKey } from "@endpoints/shared";
import { i18nextPlugin } from "@squide/i18next";

export function createI18NextPlugin() {
    const plugin = new i18nextPlugin<LanguageKey>(["en-US", "fr-CA"], "en-US", "language");

    // By default, detect user default language for anonymous pages.
    // If the user is authenticated, the language will be changed for the persisted user
    // preferred language once the session is loaded.
    plugin.detectUserLanguage();

    return plugin;
}
