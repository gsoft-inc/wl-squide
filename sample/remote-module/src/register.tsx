import { BackgroundColorContext } from "@sample/shared";
import { getMswPlugin } from "@squide/msw";
import type { ModuleRegisterFunction, Runtime } from "@squide/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { ReactNode } from "react";
import { requestHandlers } from "../mocks/handlers.ts";

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
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    );
}

function registerRoutes(runtime: Runtime) {
    runtime.registerRoute({
        path: "/remote",
        lazy: async () => import("./Remote.tsx")
    });

    runtime.registerRoute({
        path: "/fetch",
        lazy: async () => {
            const { Fetch } = await import("./Fetch.tsx");

            return {
                element: <Providers><Fetch /></Providers>
            };
        }
    });

    runtime.registerRoute({
        path: "/hoisted",
        lazy: () => import("./CustomLayout.tsx"),
        children: [
            {
                index: true,
                lazy: () => import("./Hoisted.tsx")
            }
        ]
    }, {
        hoist: true
    });

    runtime.registerRoute({
        path: "/no-context-override",
        lazy: () => import("./ColoredPage.tsx")
    });

    runtime.registerRoute({
        path: "/context-override",
        lazy: async () => {
            const { ColoredPage } = await import("./ColoredPage.tsx");

            return {
                element: (
                    <BackgroundColorContext.Provider value="red">
                        <ColoredPage />
                    </BackgroundColorContext.Provider>
                )
            };
        }
    });

    runtime.registerNavigationItem({
        $label: "Remote",
        to: "/remote"
    });

    runtime.registerNavigationItem({
        $label: "Fetch",
        to: "/fetch"
    });

    runtime.registerNavigationItem({
        $label: <span style={{ color: "green" }}>Hoisted</span>,
        to: "/hoisted"
    });

    runtime.registerNavigationItem({
        $label: "Section",
        children: [
            {
                to: "#",
                $label: "Child 1"
            },
            {
                to: "#",
                $label: "Child 2"
            }
        ]
    });

    runtime.registerNavigationItem({
        $label: "No context override",
        to: "/no-context-override"
    });

    runtime.registerNavigationItem({
        $label: "Context override",
        to: "/context-override"
    });

    // Register federated tabs.

    runtime.registerRoute({
        path: "/federated-tabs/officevibe",
        lazy: () => import("./OfficevibeTab.tsx")
    }, {
        parentPath: "/federated-tabs"
    });

    runtime.registerRoute({
        path: "/federated-tabs/skills",
        lazy: () => import("./SkillsTab.tsx")
    }, {
        parentPath: "/federated-tabs"
    });

    runtime.registerNavigationItem({
        $label: "Officevibe",
        to: "/federated-tabs/officevibe"
    }, {
        menuId: "/federated-tabs"
    });

    runtime.registerNavigationItem({
        $label: "Skills",
        $priority: 999,
        to: "/federated-tabs/skills"
    }, {
        menuId: "/federated-tabs"
    });
}

function registerMsw(runtime: Runtime) {
    const mswPlugin = getMswPlugin(runtime);

    mswPlugin.registerRequestHandlers(requestHandlers);
}

export const register: ModuleRegisterFunction<Runtime> = runtime => {
    registerRoutes(runtime);
    registerMsw(runtime);
};
