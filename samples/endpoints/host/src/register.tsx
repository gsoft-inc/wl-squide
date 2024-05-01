import type { FireflyRuntime, ModuleRegisterFunction } from "@squide/firefly";
import { I18nextNavigationItemLabel } from "@squide/i18next";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { i18n } from "i18next";
import type { ReactNode } from "react";
import { initI18next } from "./i18next.ts";

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
    children: ReactNode;
}

function Providers({ children }: ProvidersProps) {
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
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
