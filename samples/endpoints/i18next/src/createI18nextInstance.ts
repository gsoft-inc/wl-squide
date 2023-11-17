import type { LanguageKey } from "@endpoints/shared";
import type { Resource } from "i18next";
import i18n from "i18next";
import ChainedBackend, { type ChainedBackendOptions } from "i18next-chained-backend";
import resourcesToBackend from "i18next-resources-to-backend";
import { initReactI18next } from "react-i18next";

export interface CreateI18nextInstanceOptions {
    eagerResources?: Resource;
}

export async function createI18nextInstance(language: LanguageKey, loadResources: (language: LanguageKey, namespace: string) => Promise<unknown>, { eagerResources }: CreateI18nextInstanceOptions = {}) {
    const instance = i18n.createInstance()
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        .use(ChainedBackend)
        .use(initReactI18next);

    instance.init<ChainedBackendOptions>({
        debug: true,
        lng: language,
        partialBundledLanguages: true,
        load: "currentOnly",
        backend: {
            backends: [
                resourcesToBackend((x: string, y: string) => loadResources(x as LanguageKey, y))
            ]
        },
        resources: eagerResources
    });

    return instance;
}
