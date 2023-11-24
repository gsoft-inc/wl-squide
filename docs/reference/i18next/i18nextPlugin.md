---
order: 100
toc:
    depth: 2-3
---

# i18nextPlugin

A plugin to faciliate the integration of [i18next](https://www.i18next.com/) in a federated application.

## Reference

```ts
const plugin = new i18nextPlugin(supportedLanguages: [], fallbackLanguage, queryStringKey, options?: { detection?: {} })
```

### Parameters

- `supportedLanguages`: An array of languages supported by the application.
- `fallbackLanguage`: The language to default to if none of the detected user's languages match any supported language.
- `queryStringKey`: The querystring parameter lookup when detecting the user's language.
- `options`: An optional object literal of options:
    - `detection`: An optional object literal accepting any [LanguageDetector](https://github.com/i18next/i18next-browser-languageDetector#detector-options) options.

## Usage

### Register the plugin

```ts !#5
import { i18nextPlugin } from "@squide/i18next";
import { FireflyRuntime } from "@squide/firefly";

const runtime = new FireflyRuntime({
    plugins: [new i18nextPlugin(["en-US", "fr-CA"], "en-US", "language")]
});
```

### Retrieve the plugin instance

```ts
import { i18nextPlugin } from "@squide/i18next";

const plugin = runtime.getPlugin(i18nextPlugin.name) as i18nextPlugin;
```

[!ref Prefer using `getI18nextPlugin` when possible](./getI18nextPlugin.md)

### Register a i18next instance

```ts !#15
import { i18nextPlugin } from "@squide/i18next";
import i18n from "./i18next";
import resourcesEn from "./locales/en.json";
import resourcesFr from "./locales/fr.json";

const instance = i18n.createInstance({
    resources: {
        "en-US": resourcesEn,
        "fr-CA": resourcesFr
    }
});

const plugin = runtime.getPlugin(i18nextPlugin.name) as i18nextPlugin;

plugin.registerInstance("an-instance-key", instance);
```

### Retrieve a i18next instance

```ts !#6
import { i18nextPlugin } from "@squide/i18next";

const plugin = runtime.getPlugin(i18nextPlugin.name) as i18nextPlugin;

// If no instance match the specified key, an error will be thrown.
const instance = plugin.getInstance("an-instance-key");
```

### Detect the user language

Whenever a plugin instance is created, the user's language should always be detected immediatly using the `detectUserLanguage` function.

```ts !#7
import { i18nextPlugin } from "@squide/i18next";
import { FireflyRuntime } from "@squide/firefly";

const plugin = new i18nextPlugin(["en-US", "fr-CA"], "en-US", "language");

// If no detected languages match any of the supported languages, the fallback language will be applied.
plugin.detectUserLanguage();

const runtime = new FireflyRuntime({
    plugins: [plugin]
});
```

### Retrieve the current language

```ts !#6
import { i18nextPlugin } from "@squide/i18next";

const plugin = runtime.getPlugin(i18nextPlugin.name) as i18nextPlugin;

// If the language hasn't been changed nor detected before getting the current language, an error will be thrown.
const language = plugin.currentLanguage;
```

### Change the current language

```ts !#6
import { i18nextPlugin } from "@squide/i18next";

const plugin = runtime.getPlugin(i18nextPlugin.name) as i18nextPlugin;

// If the language isn't included in the "supportedLanguages" array, an error will be thrown.
plugin.changeLanguage("fr-CA");
```

### Change the language detection order

By default, the detection of the user's language is done first from the specified URL querystring parameter (`?language` in this example), then from the user's [navigator language settings](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/language). The detection order can be changed by specifying a new value for the [order](https://github.com/i18next/i18next-browser-languageDetector#detector-options) detection option:

```ts !#4
const plugin = new i18nextPlugin(["en-US", "fr-CA"], "en-US", "language", {
    detection: {
        // Change the detection order to lookup the user browser default languages before the querystring parameter.
        order: ["navigator", "querystring"]
    }
});
```

### Add an additional detection source

```ts !#6,9
const plugin = new i18nextPlugin(["en-US", "fr-CA"], "en-US", "language", {
    detection: {
        order: [
            "querystring",
            // Will look for a language in the local storage before detecting the language from the user browser defaults.
            "localStorage",
            "navigator",
        ],
        lookupLocalStorage: "my-local-storage-key"
    }
});
```
