import { Plugin, isNil, type Runtime } from "@squide/core";
import LanguageDetector, { type DetectorOptions } from "i18next-browser-languagedetector";

export interface i18nextPluginOptions {
    detection?: Omit<DetectorOptions, "lookupQuerystring" | "lookupLocalStorage">;
}

export class i18nextPlugin extends Plugin {
    // #currentLanguage?: string = undefined;

    readonly #supportedLanguages: string[];
    readonly #fallbackLanguage: string;
    readonly #languageDetector: LanguageDetector;

    constructor(supportedLanguages: string[], fallbackLanguage: string, queryStringKey: string, { detection }: i18nextPluginOptions = {}) {
        super(i18nextPlugin.name);

        this.#supportedLanguages = supportedLanguages;
        this.#fallbackLanguage = fallbackLanguage;

        this.#languageDetector = new LanguageDetector(null, {
            order: ["querystring", "navigator"],
            lookupQuerystring: queryStringKey,
            ...(detection ?? {})
        });
    }

    // Maybe should have a detectLanguage() function
    getCurrentLanguage() {
        let userLanguage = this.#languageDetector.detect();

        // The navigator default language can be something like ["en-US", "en-US", "en", "en-US"].
        if (Array.isArray(userLanguage)) {
            // Ensure the navigator default language is supported.
            userLanguage = userLanguage.find(x => {
                return this.#supportedLanguages.some(y => y === x);
            });
        }

        if (isNil(userLanguage)) {
            userLanguage = this.#fallbackLanguage;
        }

        return userLanguage;
    }

    // detectAndCacheLanguage() {
    //     let userLanguage = this.#languageDetector.detect();

    //     // The navigator default language can be something like ["en-US", "en-US", "en", "en-US"].
    //     if (Array.isArray(userLanguage)) {
    //         // Ensure the navigator default language is supported.
    //         userLanguage = userLanguage.find(x => {
    //             return this.#supportedLanguages.some(y => y === x);
    //         });
    //     }

    //     if (isNil(userLanguage)) {
    //         userLanguage = this.#fallbackLanguage;
    //     }

    //     this.#currentLanguage = userLanguage;
    //     this.#languageDetector.cacheUserLanguage(userLanguage);
    // }

    // getCurrentLanguage() {
    //     if (isNil(this.#currentLanguage)) {
    //         throw new Error("[squide] The getCurrentLanguage function is called but no user language has been detected yet. Did you forget to call the detectLanguage function?");
    //     }

    //     return this.#currentLanguage;
    // }
}

export function getI18nPlugin(runtime: Runtime) {
    const plugin = runtime.getPlugin(i18nextPlugin.name);

    if (isNil(plugin)) {
        throw new Error("[squide] The getI18nPlugin function is called but no i18nextPlugin instance has been registered with the runtime.");
    }

    return plugin as i18nextPlugin;
}
