import { getMswPlugin } from "@squide/msw";
import type { ModuleRegisterFunction, Runtime } from "@squide/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { characterHandlers } from "../mocks/characterHandlers.ts";

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

function registerRoutes(runtime: Runtime) {
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
        $label: "Home",
        $priority: 999,
        to: "/"
    });
}

function registerMsw(runtime: Runtime) {
    const mswPlugin = getMswPlugin(runtime);

    mswPlugin.registerRequestHandlers(characterHandlers);
}

export const registerHost: ModuleRegisterFunction<Runtime> = runtime => {
    registerRoutes(runtime);
    registerMsw(runtime);
};
