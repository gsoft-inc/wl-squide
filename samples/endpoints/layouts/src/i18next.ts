import { createI18nextInstance as createInstance } from "@endpoints/i18next";
import type { LanguageKey } from "@endpoints/shared";
import resourcesEn from "./locales/en-US/resources.json";
import resourcesFr from "./locales/fr-CA/resources.json";

export async function createI18nextInstance(currentLanguage: LanguageKey) {
    return createInstance(currentLanguage, {
        resources: {
            "en-US": resourcesEn,
            "fr-CA": resourcesFr
        }
    });
}


