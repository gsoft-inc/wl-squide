---
order: 820
---

# Setup i18next

Most of the applications that forms the Workleap platform are either already bilingual or will be in the future. To help feature teams with localized resources, Squide provides a native [plugin](../reference/i18next/i18nextPlugin.md) designed to adapt the [i18next](https://www.i18next.com/) library for federated applications.

!!!warning
The examples in this guide load all the resources from single localized resources files. For a real Workleap application, you probably want to spread the resources into multiple files and load the files with a i18next [backend plugin](https://www.i18next.com/overview/plugins-and-utils#backends).
!!!

## Setup the host application

Let's start by configuring the host application. First, open a terminal at the root of the host application and install the following packages:

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

```tsx !#16,19,22 host/src/bootstrap.tsx
import { createRoot } from "react-dom/client";
import { ConsoleLogger, RuntimeContext, FireflyRuntime, registerRemoteModules, type RemoteDefinition } from "@squide/firefly";
import { App } from "./App.tsx";
import { registerHost } from "./register.tsx";
import { registerShell } from "@sample/shell";
import { i18nextPlugin } from "@sample/i18next";

const Remotes: RemoteDefinition[] = [
    { url: name: "remote1" }
];

// In this example:
// - The supported languages are "en-US" and "fr-CA"
// - The fallback language is "en-US"
// - The URL querystring parameter to detect the current language is "language"
const i18nextPlugin = new i18nextPlugin(["en-US", "fr-CA"], "en-US", "language");

// Always detect the user language early on.
i18nextPlugin.detectUserLanguage();

const runtime = new FireflyRuntime({
    plugins: [i18nextPlugin]
    loggers: [new ConsoleLogger()]
});

await registerLocalModules([registerShell, registerHost], runtime);

await registerRemoteModules(Remotes, runtime);

const root = createRoot(document.getElementById("root")!);

root.render(
    <RuntimeContext.Provider value={runtime}>
        <App />
    </RuntimeContext.Provider>
);
```

In the previous code sample, upon creating an `i18nextPlugin` instance, the user language is automatically detected using the `plugin.detectUserLanguage` function. Applications **should always** detect the user language at bootstrapping, even if the current language is expected to be overriden by a preferred language setting once the user session has been loaded.

### Define the localized resources

Next, create the localized resource files for the `en-US` and `fr-CA` locales:

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

### Register an i18next instance

Then, update the [local module](../reference/registration/registerLocalModules.md) register function to create and register an instance of `i18next` with the `i18nextPlugin` plugin instance:

```tsx !#12-14,16-23,26 host/src/register.tsx
import type { ModuleRegisterFunction, FireflyRuntime } from "@squide/firefly";
import { getI18nextPlugin } from "@squide/i18next";
import { HomePage } from "./HomePage.tsx";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import resourcesEn from "./locales/en-US/resources.json";
import resourcesFr from "./locales/fr-CA/resources.json";

export const registerHost: ModuleRegisterFunction<FireflyRuntime> = runtime => {
    const i18nextPlugin = getI18nextPlugin(runtime);

    const i18nextInstance = i18n
        .createInstance()
        .use(initReactI18next);

    i18nextInstance.init({
        // Create the instance with the language that has been detected earlier in the bootstrapping code.
        lng: i18nextPlugin.currentLanguage,
        resources: {
            "en-US": resourcesEn,
            "fr-CA": resourcesFr
        }
    });

    // Will associate the instance with the "host" key.
    i18nextPlugin.registerInstance("host", i18nextInstance);

    // --------

    runtime.registerRoute({
        index: true,
        element: <HomePage />
    });
};
```

In the previous code sample, notice that the `i18next` instance has been initialized with the current language of the `i18nextPlugin` instance by providing the `lng` option. If the user language has been detected during bootstrapping, the `i18next` instance will be initialized with the user language which has been deduced from either a `?language` querystring parameter or the user navigator language settings. Otherwise, the application instance will be initialized with the fallback language.

### Localize the home page resources

Then, update the `HomePage` component to use the newly created localized resource:

```tsx !#6-7,10 host/src/HomePage.tsx
import { useI18nextInstance } from "@squide/i18next";
import { useTranslation } from "react-i18next";

export function HomePage() {
    // Must be the same instance key that has been used to register the i18next instance previously in the "register" function.
    const i18nextInstance = useI18nextInstance("host");
    const { t } = useTranslation("HomePage", { i18n: i18nextInstance });

    return (
        <div>{t("bodyText")}</div>
    );
}
```

### Update the webpack configurations

Finally, update the webpack development and build configurations to activate the `i18next` feature:

```js !#7-9 host/webpack.dev.js
// @ts-check

import { defineDevHostConfig } from "@squide/firefly-webpack-configs";
import { swcConfig } from "./swc.dev.js";

export default defineDevHostConfig(swcConfig, 8080, [], {
    features: {
        i18next: true
    },
    sharedDependencies: {
        "@sample/shared": {
            singleton: true,
            eager: true
        }
    }
});
```

```js !#7-9 host/webpack.build.js
// @ts-check

import { defineBuildHostConfig } from "@squide/firefly-webpack-configs";
import { swcConfig } from "./swc.build.js";

export default defineBuildHostConfig(swcConfig, [], {
    features: {
        i18next: true
    },
    sharedDependencies: {
        "@sample/shared": {
            singleton: true,
            eager: true
        }
    }
});
```

## Setup a remote module

First, open a terminal at the root of the remote module application and install the following packages:

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

### Define the localized resources

Then, create the localized resource files for the `en-US` and `fr-CA` locales:

```json remote-module/src/locales/en-US.json
{
    "navigationItems": {
        "page": "Remote/Page - en-US"
    },
    "Page": {
        "bodyText": "Hello from Remote/Page!"
    }
}
```

```json remote-module/src/locales/fr-CA.json
{
    "navigationItems": {
        "page": "Remote/Page - fr-CA"
    },
    "Page": {
        "bodyText": "Bonjour depuis Remote/Page!"
    }
}
```

Notice that this time, a standard `navigationItems` namespace has been added to the resource files. The resources in the `navigationItems` namespace will be used later on to localize the [navigation items](../reference/registration/registerLocalModules.md) labels.

### Register an i18next instance

Then, update the [local module](../reference/registration/registerLocalModules.md) register function to create and register an instance of `i18next` with the `i18nextPlugin` plugin instance:

```tsx !#10,12-14,16-23,26 remote-module/src/register.tsx
import type { ModuleRegisterFunction, FireflyRuntime } from "@squide/firefly";
import { getI18nextPlugin } from "@squide/i18next";
import { Page } from "./Page.tsx";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import resourcesEn from "./locales/en-US/resources.json";
import resourcesFr from "./locales/fr-CA/resources.json";

export const register: ModuleRegisterFunction<FireflyRuntime> = runtime => {
    const i18nextPlugin = getI18nextPlugin(runtime);

    const i18nextInstance = i18n
        .createInstance()
        .use(initReactI18next);

    i18nextInstance.init({
        // Create the instance with the language that has been detected earlier in the host application bootstrapping code.
        lng: i18nextPlugin.currentLanguage,
        resources: {
            "en-US": resourcesEn,
            "fr-CA": resourcesFr
        }
    });

    // Will associate the instance with the "remote-module" key.
    i18nextPlugin.registerInstance("remote-module", i18nextInstance);

    // --------

    runtime.registerRoute({
        path: "/remote/page",
        element: <Page />
    });

    runtime.registerNavigationItem({
        $label: "Remote/Page",
        to: "/remote/page"
    });
}
```

### Localize the navigation item labels

Then, localize the navigation items labels using the [I18nextNavigationItemLabel](../reference/i18next/I18nextNavigationItemLabel.md) component. Since for this example, the resources are in the `navigationItems` namespace, there's no need to specify a `namespace` property on the components as it will be inferred:

```tsx !#37 remote-module/src/register.tsx
import type { ModuleRegisterFunction, FireflyRuntime } from "@squide/firefly";
import { getI18nextPlugin, I18nextNavigationItemLabel } from "@squide/i18next";
import { Page } from "./Page.tsx";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import resourcesEn from "./locales/en-US/resources.json";
import resourcesFr from "./locales/fr-CA/resources.json";

export const register: ModuleRegisterFunction<FireflyRuntime> = runtime => {
    const i18nextPlugin = getI18nextPlugin(runtime);

    const i18nextInstance = i18n
        .createInstance()
        .use(initReactI18next);

    i18nextInstance.init({
        // Create the instance with the language that has been detected earlier in the host application bootstrapping code.
        lng: i18nextPlugin.currentLanguage,
        load: "currentOnly",
        resources: {
            "en-US": resourcesEn,
            "fr-CA": resourcesFr
        }
    });

    // Will associate the instance with the "remote-module" key.
    i18nextPlugin.registerInstance("remote-module", i18nextInstance);

    // --------

    runtime.registerRoute({
        path: "/remote/page",
        element: <Page />
    });

    runtime.registerNavigationItem({
        $label: <I18nextNavigationItemLabel i18next={i18nextInstance} resourceKey="page" />,
        to: "/remote/page"
    });
}
```

### Localize the page resources

Then, update the `HomePage` component to use the newly created localized resource:

```tsx !#6,7,10 remote-module/src/Page.tsx
import { useI18nextInstance } from "@squide/i18next";
import { useTranslation } from "react-i18next";

export function Page() {
    // Must be the same instance key that has been used to register the i18next instance previously in the "register" function.
    const i18nextInstance = useI18nextInstance("remote-module");
    const { t } = useTranslation("Page", { i18n: useI18nextInstance });

    return (
        <div>{t("bodyText")}</div>
    );
}
```

### Update the webpack configurations

Finally, update the webpack development and build configurations to activate the `i18next` feature:

```js !#7-9 remote-module/webpack.dev.js
// @ts-check

import { defineDevRemoteModuleConfig } from "@squide/firefly-webpack-configs";
import { swcConfig } from "./swc.dev.js";

export default defineDevRemoteModuleConfig(swcConfig, "remote1", 8081, {
    features: {
        i18next: true
    },
    sharedDependencies: {
        "@sample/shared": {
            singleton: true
        }
    }
});
```

```js !#7-9 remote-module/webpack.build.js
// @ts-check

import { defineBuildRemoteModuleConfig } from "@squide/firefly-webpack-configs";
import { swcConfig } from "./swc.build.js";

export default defineBuildRemoteModuleConfig(swcConfig, "remote1", {
    features: {
        i18next: true
    },
    sharedDependencies: {
        "@sample/shared": {
            singleton: true
        }
    }
});
```

## Setup a local module

Follow the same steps as for a [remote module](#setup-a-remote-module).

## Integrate a backend language setting

For many applications, the displayed language is expected to be derived from an application specific user "preferred language" setting stored in a database on the backend. Therefore, the frontend remains unaware of this setting value until the user session is loaded.

Hence, the strategy to select the displayed language should be as follow:

1. Utilize the language detected at bootstrapping for anonymous users (with the `detectUserLanguage` function).

2. Upon user authentication and session loading, if a "preferred language" setting is available from the session data, update the displayed language to reflect this preference.

To implement this strategy, use the [useChangeLanguage](../reference/i18next/useChangeLanguage.md) hook and the [onLoadProtectedData](../reference/routing/appRouter.md#load-protected-data) handler of the [AppRouter](../reference/routing/appRouter.md) component:

```tsx !#17,29,31-33,40-41 host/src/App.tsx
import { AppRouter } from "@squide/firefly";
import { useChangeLanguage, useI18nextInstance } from "@squide/i18next";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

async function fetchProtectedData(changeLanguage: (language: string) => void, setIsSessionLoaded: (isLoaded: boolean) => void, signal: AbortSignal) {
    const response = await fetch("/api/session", {
        signal
    });
    
    if (response.ok) {
        const session = await response.json();

        // When the session has been retrieved, change the displayed language to match
        // the preferred language setting.
        changeLanguage(session.preferredLanguage);

        setIsSessionLoaded(true);
    }
}

export function App() {
    const [isSessionLoaded, setIsSessionLoaded] = useState(false);

    const i18nextInstance = useI18nextInstance("host");
    const { t } = useTranslation("App", { i18n: useI18nextInstance });

    const changeLanguage = useChangeLanguage();

    const handleLoadProtectedData = useCallback((signal: AbortSignal) => {
        return fetchProtectedData(changeLanguage, setIsSessionLoaded, signal);
    }, [changeLanguage]);

    return (
        <AppRouter
            fallbackElement={<div>{t("loadingMessage")}</div>}
            errorElement={<div>{t("errorMessage")}</div>}
            waitForMsw={false}
            onLoadProtectedData={handleLoadProtectedData}
            isProtectedDataLoaded={isSessionLoaded}
        >
            {(routes, providerProps) => (
                <RouterProvider router={createBrowserRouter(routes)} {...providerProps} />
            )}
        </AppRouter>
    );
}
```

## Use the Trans component

The [Trans](https://react.i18next.com/latest/trans-component) component is valuable for scenarios that involve interpolation to render a localized resource. To use the `Trans` component with Squide, pair the component with an `i18next` instance retrieved from [useI18nextInstance](../reference/i18next/useI18nextInstance.md) hook:

```tsx !#5,9,11
import { useI18nextInstance } from "@squide/i18next";
import { Trans, useTranslation } from "react-i18next";

const instance = useI18nextInstance("an-instance-key");
const { t } = useTranslation("a-namespace", { i18n: instance });

return (
    <Trans
        i18n={instance}
        i18nKey="a-key"
        t={t}
    />
);
```

The `Trans` component can also be used without the `t` function by including a namespace to the `i18nKey` property value:

```tsx !#4,8,9
import { useI18nextInstance } from "@squide/i18next";
import { Trans, useTranslation } from "react-i18next";

const instance = useI18nextInstance("an-instance-key");

return (
    <Trans
        i18n={instance}
        i18nKey="a-namespace:a-key"
    />
);
```

## Try it :rocket:

Start the development servers using the `dev` script. The homepage and the navigation items should render the english (`en-US`) resources. Then append `?language=fr-CA` to the URL. The homepage and the navigation items should now render the french (`fr-CA`) resources.

### Troubleshoot issues

If you are experiencing issues with this guide:

- Open the [DevTools](https://developer.chrome.com/docs/devtools/) console. You'll find a log entry for each `i18next` instance that is being registered and another log everytime the language is changed:
    - `[squide] Registered a new i18next instance with key "remote-module": ...`
    - `[squide] The language has been changed to "fr-CA".`
- Refer to a working example on [GitHub](https://github.com/gsoft-inc/wl-squide/tree/main/samples/endpoints).
- Refer to the [troubleshooting](../troubleshooting.md) page.
