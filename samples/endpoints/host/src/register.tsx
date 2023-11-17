import type { LanguageKey } from "@endpoints/shared";
import type { FireflyRuntime, ModuleRegisterFunction } from "@squide/firefly";
import { I18nextNavigationLabel, getI18nextPlugin, type i18nextPlugin } from "@squide/i18next";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { i18n } from "i18next";
import type { ReactNode } from "react";
import { I18nextProvider } from "react-i18next";
import { createI18nextInstance } from "./i18next.ts";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: failureCount => {
                return failureCount <= 2;
            }
        }
    }
});

interface ProvidersProps {
    i18nextInstance: i18n;
    children: ReactNode;
}

function Providers({ i18nextInstance, children }: ProvidersProps) {
    return (
        <QueryClientProvider client={queryClient}>
            <I18nextProvider i18n={i18nextInstance}>
                {children}
            </I18nextProvider>
        </QueryClientProvider>
    );
}

function registerRoutes(runtime: FireflyRuntime, i18nextInstance: i18n) {
    runtime.registerRoute({
        index: true,
        lazy: async () => {
            const { HomePage } = await import("./HomePage.tsx");

            return {
                element: <Providers i18nextInstance={i18nextInstance}><HomePage /></Providers>
            };
        }
    });

    runtime.registerNavigationItem({
        $label: <I18nextNavigationLabel i18nextInstance={i18nextInstance} resourceKey="navigationItems:homePage" />,
        $priority: 999,
        to: "/"
    });
}

async function registerMsw(runtime: FireflyRuntime) {
    if (process.env.USE_MSW) {
        // Files including an import to the "msw" package are included dynamically to prevent adding
        // MSW stuff to the bundled when it's not used.
        const requestHandlers = (await import("../mocks/handlers.ts")).requestHandlers;

        runtime.registerRequestHandlers(requestHandlers);
    }
}

export const registerHost: ModuleRegisterFunction<FireflyRuntime> = async runtime => {
    const plugin = getI18nextPlugin(runtime) as i18nextPlugin<LanguageKey>;
    const i18nextInstance = await createI18nextInstance(plugin.currentLanguage);

    plugin.registerInstance(i18nextInstance);

    await registerMsw(runtime);

    return registerRoutes(runtime, i18nextInstance);
};
