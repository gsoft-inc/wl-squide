import type { FireflyRuntime, ModuleRegisterFunction } from "@squide/firefly";
import { I18nextNavigationItemLabel } from "@squide/i18next";
import type { i18n } from "i18next";
import type { PropsWithChildren } from "react";
import { QueryProvider } from "./QueryProvider.tsx";
import { initI18next } from "./i18next.ts";

function Providers({ children }: PropsWithChildren) {
    return (
        <QueryProvider>
            {children}
        </QueryProvider>
    );
}

function registerRoutes(runtime: FireflyRuntime, i18nextInstance: i18n) {
    runtime.registerRoute({
        index: true,
        lazy: async () => {
            const { HomePage } = await import("./HomePage.tsx");

            return {
                element: <Providers><HomePage /></Providers>
            };
        }
    });

    runtime.registerNavigationItem({
        $key: "home",
        $label: <I18nextNavigationItemLabel i18next={i18nextInstance} resourceKey="homePage" />,
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
    const i18nextInstance = initI18next(runtime);

    await registerMsw(runtime);

    return registerRoutes(runtime, i18nextInstance);
};
