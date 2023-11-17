import { Plugin, isNil, type Runtime } from "@squide/core";
import type { i18n } from "i18next";
import LanguageDetector, { type DetectorOptions } from "i18next-browser-languagedetector";
import { i18nInstanceRegistry } from "./i18nInstanceRegistry.ts";

export interface i18nextPlugin2Options {
    detection?: Omit<DetectorOptions, "lookupQuerystring" | "lookupLocalStorage">;
}

export class i18nextPlugin2<T extends string = string> extends Plugin {
    #currentLanguage?: T = undefined;

    readonly #supportedLanguages: T[];
    readonly #fallbackLanguage: T;
    readonly #languageDetector: LanguageDetector;
    readonly #registry = new i18nInstanceRegistry();

    constructor(supportedLanguages: T[], fallbackLanguage: T, queryStringKey: string, { detection }: i18nextPlugin2Options = {}) {
        super(i18nextPlugin2.name);

        this.#supportedLanguages = supportedLanguages;
        this.#fallbackLanguage = fallbackLanguage;

        this.#languageDetector = new LanguageDetector(null, {
            order: ["querystring", "navigator"],
            lookupQuerystring: queryStringKey,
            ...(detection ?? {})
        });
    }

    registerInstance(instance: i18n) {
        this.#registry.add(instance);
    }

    detectUserLanguage() {
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

        this.#currentLanguage = userLanguage as T;
    }

    get currentLanguage() {
        if (isNil(this.#currentLanguage)) {
            throw new Error("[squide] The currentLanguage getter is called but no user language has been detected yet. Did you forget to call the detectUserLanguage function?");
        }

        return this.#currentLanguage;
    }

    changeLanguage(language: T) {
        if (!this.#supportedLanguages.includes(language)) {
            throw new Error(`[squide] Cannot change language for ${language} because it's not a supported languages. Support languages are ${this.#supportedLanguages.map(x => `"${x}"`).join(",")}.`);
        }

        this.#registry.instances.forEach(x => {
            x.changeLanguage(language);
        });

        this.#currentLanguage = language;
    }
}

export function getI18nPlugin2(runtime: Runtime) {
    const plugin = runtime.getPlugin(i18nextPlugin2.name);

    if (isNil(plugin)) {
        throw new Error("[squide] The getI18nPlugin function is called but no i18nextPlugin instance has been registered with the runtime.");
    }

    return plugin as i18nextPlugin2;
}
