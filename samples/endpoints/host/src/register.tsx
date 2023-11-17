import type { FireflyRuntime, ModuleRegisterFunction } from "@squide/firefly";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import i18n, { initI18n } from "./i18n.ts";

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

function Providers({ children }: { children: ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}

function registerRoutes(runtime: FireflyRuntime) {
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
        $label: i18n.t("navigationItems:homePage"),
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
    await initI18n(runtime);
    await registerMsw(runtime);

    return registerRoutes(runtime);
};
