import { BackgroundColorContext } from "@sample/shared";
import { getMswPlugin } from "@squide/msw";
import type { ModuleRegisterFunction, Runtime } from "@squide/react-router";
import { requestHandlers } from "../mocks/handlers.ts";

export const register: ModuleRegisterFunction<Runtime> = runtime => {
    runtime.registerRoutes([
        {
            path: "/remote",
            lazy: async () => import("./Remote.tsx")
        },
        {
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
        },
        {
            hoist: true,
            visibility: "public",
            path: "/hoisted",
            lazy: () => import("./CustomLayout.tsx"),
            children: [
                {
                    index: true,
                    lazy: () => import("./Hoisted.tsx")
                }
            ]
        },
        {
            path: "/no-context-override",
            lazy: () => import("./ColoredPage.tsx")
        },
        {
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
        }
    ]);

    runtime.registerNavigationItems([
        {
            to: "/remote",
            label: "Remote"
        },
        {
            to: "/fetch",
            label: "Fetch"
        },
        {
            to: "/hoisted",
            label: <span style={{ color: "green" }}>Hoisted</span>
        },
        {
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
        },
        {
            to: "/no-context-override",
            label: "No context override"
        },
        {
            to: "/context-override",
            label: "Context override"
        }
    ]);

    // Register federated tabs.

    runtime.registerRoutes([
        {
            path: "/federated-tabs/officevibe",
            lazy: () => import("./OfficevibeTab.tsx")
        },
        {
            path: "/federated-tabs/skills",
            lazy: () => import("./SkillsTab.tsx")
        }
    ], { parentPath: "/federated-tabs" });

    runtime.registerNavigationItems([
        {
            to: "/federated-tabs/officevibe",
            label: "Officevibe"
        },
        {
            to: "/federated-tabs/skills",
            label: "Skills",
            priority: 999
        }
    ], { menuId: "/federated-tabs" });

    // Register request handlers for MSW.

    const mswPlugin = getMswPlugin(runtime);
    mswPlugin.registerRequestHandlers(requestHandlers);
};
