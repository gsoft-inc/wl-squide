import { Plugin, isNil, type Runtime } from "@squide/core";
import type { i18n } from "i18next";
import LanguageDetector, { type DetectorOptions } from "i18next-browser-languagedetector";
import { i18nextInstanceRegistry } from "./i18nextInstanceRegistry.ts";

export interface i18nextPluginOptions {
    detection?: Omit<DetectorOptions, "lookupQuerystring" | "lookupLocalStorage">;
}

export class i18nextPlugin<T extends string = string> extends Plugin {
    #runtime?: Runtime;
    #currentLanguage?: T;

    readonly #supportedLanguages: T[];
    readonly #fallbackLanguage: T;
    readonly #languageDetector: LanguageDetector;
    readonly #registry = new i18nextInstanceRegistry();

    constructor(supportedLanguages: T[], fallbackLanguage: T, queryStringKey: string, { detection }: i18nextPluginOptions = {}) {
        super(i18nextPlugin.name);

        this.#supportedLanguages = supportedLanguages;
        this.#fallbackLanguage = fallbackLanguage;

        this.#languageDetector = new LanguageDetector(null, {
            order: ["querystring", "navigator"],
            lookupQuerystring: queryStringKey,
            ...(detection ?? {})
        });
    }

    setRuntime(runtime: Runtime) {
        this.#runtime = runtime;
    }

    registerInstance(key: string, instance: i18n) {
        this.#registry.add(key, instance);

        this.#runtime?.logger.debug(`[squide] Registered a new i18next instance with key: "${key}"`, instance);
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
            throw new Error(`[squide] Cannot change language for ${language} because it's not a supported languages. Supported languages are ${this.#supportedLanguages.map(x => `"${x}"`).join(",")}.`);
        }

        this.#registry.getInstances().forEach(x => {
            x.changeLanguage(language);
        });

        this.#currentLanguage = language;
    }

    getInstance(key: string) {
        return this.#registry.getInstance(key);
    }
}

export function getI18nextPlugin(runtime: Runtime) {
    const plugin = runtime.getPlugin(i18nextPlugin.name);

    if (isNil(plugin)) {
        throw new Error("[squide] The getI18nextPlugin function is called but no i18nextPlugin instance has been registered with the runtime.");
    }

    return plugin as i18nextPlugin;
}
