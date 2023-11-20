import type { FireflyRuntime, ModuleRegisterFunction } from "@squide/firefly";
import { I18nextNavigationLabel } from "@squide/i18next";
import type { i18n } from "i18next";
import { initI18next } from "./i18next.ts";

export interface RegisterLayoutsOptions {
    host?: string;
}

function registerRoutes(runtime: FireflyRuntime, i18nextInstance: i18n, host?: string) {
    runtime.registerRoute({
        path: "/federated-tabs",
        lazy: async () => {
            const { FederatedTabsLayout } = await import("./FederatedTabsLayout.tsx");

            return {
                element: <FederatedTabsLayout host={host} />
            };
        }
    });

    runtime.registerNavigationItem({
        $label: <I18nextNavigationLabel i18next={i18nextInstance} resourceKey="tabsPage" />,
        to: "/federated-tabs"
    });
}

export function registerLayouts({ host }: RegisterLayoutsOptions = {}) {
    const register: ModuleRegisterFunction<FireflyRuntime> = async runtime => {
        const i18nextInstance = await initI18next(runtime);

        return registerRoutes(runtime, i18nextInstance, host);
    };

    return register;
}
