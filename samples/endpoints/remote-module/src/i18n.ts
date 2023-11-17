import type { LanguageKey } from "@endpoints/shared";
import type { FireflyRuntime } from "@squide/firefly";
import { getI18nPlugin2, type i18nextPlugin2 } from "@squide/i18next";
import i18n, { type InitOptions } from "i18next";
import ChainedBackend, { type ChainedBackendOptions } from "i18next-chained-backend";
import resourcesToBackend from "i18next-resources-to-backend";
import { initReactI18next } from "react-i18next";

async function loadResources(language: LanguageKey, fileName: string) {
    return import(`./locales/${language}/${fileName}.json`);
}

export async function initI18n(runtime: FireflyRuntime) {
    const i18nextPlugin = getI18nPlugin2(runtime) as i18nextPlugin2<LanguageKey>;

    // Eagerly loading the navigation items resources as they are needed immediatly at bootstrapping.
    // const navigationItemResources = await loadResources(currentLanguage, "navigationItems");
    const navigationItemResourcesEn = await loadResources("en-US", "navigationItems");
    const navigationItemResourcesFr = await loadResources("fr-CA", "navigationItems");

    const options: InitOptions<ChainedBackendOptions> = {
        debug: true,
        lng: i18nextPlugin.currentLanguage,
        partialBundledLanguages: true,
        load: "currentOnly",
        backend: {
            backends: [
                resourcesToBackend((language: string, namespace: string) => loadResources(language as LanguageKey, namespace))
            ]
        },
        resources: {
            // [currentLanguage]: {
            //     navigationItems: navigationItemResources
            // }
            "en-US": {
                navigationItems: navigationItemResourcesEn
            },
            "fr-CA": {
                navigationItems: navigationItemResourcesFr
            }
        }
    };

    i18n
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        .use(ChainedBackend)
        .use(initReactI18next)
        .init(options);

    i18nextPlugin.registerInstance(i18n);
}


export default i18n;
