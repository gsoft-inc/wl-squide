import { createI18nextInstance as createInstance } from "@endpoints/i18next";
import type { LanguageKey } from "@endpoints/shared";

function loadResources(language: LanguageKey, fileName: string) {
    // console.log("|||||||||||||", import.meta.resolve("./locales"));

    // return import(`./locales/${language}/${fileName}.json`);

    return import(`./locales/${language}/${fileName}.json`);
}

export async function createI18nextInstance(currentLanguage: LanguageKey) {
    return createInstance(currentLanguage, loadResources, {
        // Eagerly loading the navigation items resources as they are needed immediatly at bootstrapping.
        eagerResources: {
            "en-US": {
                navigationItems: await loadResources("en-US", "navigationItems")
            },
            "fr-CA": {
                navigationItems: await loadResources("fr-CA", "navigationItems")
            }
        }
    });
}
