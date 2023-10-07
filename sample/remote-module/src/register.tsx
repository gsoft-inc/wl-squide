import { BackgroundColorContext } from "@sample/shared";
import { getMswPlugin } from "@squide/msw";
import type { ModuleRegisterFunction, Runtime } from "@squide/react-router";
import { requestHandlers } from "../mocks/handlers.ts";

export const register: ModuleRegisterFunction<Runtime> = runtime => {
    runtime.registerRoute({
        path: "/remote",
        lazy: async () => import("./Remote.tsx")
    });

    runtime.registerRoute({
        path: "/fetch",
        lazy: () => import("./Fetch.tsx"),
        loader: async function loader() {
            return fetch("https://rickandmortyapi.com/api/character/1,2,3,4,5", {
                method: "GET",
                headers: {
                    "Accept": "application/json"
                }
            });
        }
    });

    runtime.registerRoute({
        hoist: true,
        path: "/hoisted",
        lazy: () => import("./CustomLayout.tsx"),
        children: [
            {
                index: true,
                lazy: () => import("./Hoisted.tsx")
            }
        ]
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
        to: "/remote",
        label: "Remote"
    });

    runtime.registerNavigationItem({
        to: "/fetch",
        label: "Fetch"
    });

    runtime.registerNavigationItem({
        to: "/hoisted",
        label: <span style={{ color: "green" }}>Hoisted</span>
    });

    runtime.registerNavigationItem({
        label: "Section",
        children: [
            {
                to: "#",
                label: "Child 1"
            },
            {
                to: "#",
                label: "Child 2"
            }
        ]
    });

    runtime.registerNavigationItem({
        to: "/no-context-override",
        label: "No context override"
    });

    runtime.registerNavigationItem({
        to: "/context-override",
        label: "Context override"
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
        to: "/federated-tabs/officevibe",
        label: "Officevibe"
    }, {
        menuId: "/federated-tabs"
    });

    runtime.registerNavigationItem({
        to: "/federated-tabs/skills",
        label: "Skills",
        priority: 999
    }, {
        menuId: "/federated-tabs"
    });

    // Register request handlers for MSW.

    const mswPlugin = getMswPlugin(runtime);
    mswPlugin.registerRequestHandlers(requestHandlers);
};
