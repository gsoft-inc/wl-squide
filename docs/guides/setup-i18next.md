---
order: 210
label: Setup i18next
---

# Setup i18next

Most of the [Workleap](https://workleap.com/) platform applications are, or will be bilingual. To help feature teams with localized resources, Squide offer a native [plugin](../reference/i18next/i18nextPlugin.md) to adapt the [i18next](https://www.i18next.com/) library for federated applications.

## Setup the host application

Let's start by configuring the host application. First, open a terminal at the root of the host application and install the packages:

+++ pnpm
```bash
pnpm add @squide/i18next i18next i18next-browser-languagedetector react-i18next
```
+++ yarn
```bash
yarn add @squide/i18next i18next i18next-browser-languagedetector react-i18next
```
+++ npm
```bash
npm install @squide/i18next i18next i18next-browser-languagedetector react-i18next
```
+++

!!!warning
While you can use any package manager to develop an application with Squide, it is highly recommended that you use [PNPM](https://pnpm.io/) as the guides has been developed and tested with PNPM.
!!!

### Register the i18nextPlugin

Then, update the host application boostrapping code to register an instance of the [i18nextplugin](../reference/i18next/i18nextPlugin.md) with the [FireflyRuntime](../reference/runtime/runtime-class.md) instance:

```tsx !#17,20,23 host/src/bootstrap.tsx
import { createRoot } from "react-dom/client";
import { ConsoleLogger, RuntimeContext, FireflyRuntime, registerRemoteModules, type RemoteDefinition } from "@squide/firefly";
import type { AppContext} from "@sample/shared";
import { App } from "./App.tsx";
import { registerHost } from "./register.tsx";
import { registerShell } from "@sample/shell";
import { i18nextPlugin } from "@sample/i18next";

const Remotes: RemoteDefinition[] = [
    { url: "http://localhost:8081", name: "remote1" }
];

// In this example:
// - The supported languages are: "en-US" and "fr-CA"
// - The fallback language is: "en-US"
// - The URL querystring parameter to detect the current language is: "language"
const plugin = new i18nextPlugin(["en-US", "fr-CA"], "en-US", "language");

// Always detect the user language early on.
plugin.detectUserLanguage();

const runtime = new FireflyRuntime({
    plugins: [plugin]
    loggers: [new ConsoleLogger()]
});

const context: AppContext = {
    name: "Demo application"
};

await registerLocalModules([registerShell, registerHost], runtime, { context });

await registerRemoteModules(Remotes, runtime, { context });

const root = createRoot(document.getElementById("root")!);

root.render(
    <RuntimeContext.Provider value={runtime}>
        <App />
    </RuntimeContext.Provider>
);
```

In the previous example, after creating a `i18nextPlugin` instance, the user language is automatically detected by calling the `plugin.detectUserLanguage` function. Applications should always detect the user language at bootstrapping, even if the current language is expected to be overriden by a preferred language setting once the user session has been loaded.

### Register a i18next instance

Next, if the host application register pages, navigation items or any other parts of the federated application that required localized resources, update the [register function](../reference/registration/registerLocalModules.md#register-a-local-module) to initialize and register a `i18next` instance with the `i18nextPlugin` plugin instance.

First, create localized resources files:

```json host/src/locales/en-US.json
{
    "HomePage": {
        "bodyText": "Hello from the Home page!"
    }
}
```

```json host/src/locales/fr-CA.json
{
    "HomePage": {
        "bodyText": "Bonjour depuis la page d'accueil!"
    }
}
```

Then, update the [local module](../reference/registration/registerLocalModules.md) register function to create and register an instance of `i18next`:

```tsx !#12-14,16-25,28 host/src/register.tsx
import type { ModuleRegisterFunction, FireflyRuntime } from "@squide/firefly";
import { getI18nextPlugin } from "@squide/i18next";
import { HomePage } from "./HomePage.tsx";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import resourcesEn from "./locales/en-US/resources.json";
import resourcesFr from "./locales/fr-CA/resources.json";

export const registerHost: ModuleRegisterFunction<FireflyRuntime> = runtime => {
    const plugin = getI18nextPlugin(runtime);

    const i18nextInstance = i18n
        .createInstance()
        .use(initReactI18next);

    i18nextInstance.init({
        // Create the instance with the detected user language.
        lng: plugin.currentLanguage,
        partialBundledLanguages: true,
        load: "currentOnly",
        resources: {
            "en-US": resourcesEn,
            "fr-CA": resourcesFr
        }
    });

    // Will register the instance with the "host" key.
    plugin.registerInstance("host", i18nextInstance);

    runtime.registerRoute({
        index: true,
        element: <HomePage />
    });
};
```

Then, update the `HomePage` component to use the newly created localized resource:

```tsx !#6-7,10 host/src/HomePage.tsx
import { useI18nextInstance } from "@squide/i18next";
import { useTranslation } from "react-i18next";

export function HomePage() {
    // Must be the same instance key that has been used to register the i18next instance earlier in the "register" function.
    const i18nextInstance = useI18nextInstance("host");
    const { t } = useTranslation("HomePage", { i18n: useI18nextInstance });

    return (
        <div>{t("bodyText")}</div>
    );
}
```

## Setup a remote module

## Setup a local module

## Setup a shared library

## Set the user preferred language

## Use the useTranslation hook

## Use the Trans component

## Try it :rocket:

### Troubleshoot issues
