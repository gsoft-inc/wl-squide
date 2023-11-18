import type { LanguageKey } from "@endpoints/shared";
import type { FireflyRuntime, ModuleRegisterFunction } from "@squide/firefly";
import { I18nextNavigationLabel, getI18nextPlugin, type i18nextPlugin } from "@squide/i18next";
import type { i18n } from "i18next";
import { I18nextProvider } from "react-i18next";
import { createI18nextInstance } from "./i18next.ts";

export interface RegisterLayoutsOptions {
    host?: string;
}

function registerRoutes(runtime: FireflyRuntime, i18nextInstance: i18n, host?: string) {
    runtime.registerRoute({
        path: "/federated-tabs",
        lazy: async () => {
            const { FederatedTabsLayout } = await import("./FederatedTabsLayout.tsx");

            return {
                element: <I18nextProvider i18n={i18nextInstance}><FederatedTabsLayout host={host} /></I18nextProvider>
            };
        }
    });

    runtime.registerNavigationItem({
        $label: <I18nextNavigationLabel i18nextInstance={i18nextInstance} resourceKey="navigationItems:tabsPage" />,
        to: "/federated-tabs"
    });
}

export function registerLayouts({ host }: RegisterLayoutsOptions = {}) {
    const register: ModuleRegisterFunction<FireflyRuntime> = async runtime => {
        const plugin = getI18nextPlugin(runtime) as i18nextPlugin<LanguageKey>;
        const i18nextInstance = await createI18nextInstance(plugin.currentLanguage);

        plugin.registerInstance(i18nextInstance);

        return registerRoutes(runtime, i18nextInstance, host);
    };

    return register;
}
