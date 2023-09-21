import { BackgroundColorContext } from "@sample/shared";
import type { ModuleRegisterFunction, Runtime } from "@squide/react-router";
import { lazy } from "react";

const CustomLayout = lazy(() => import("./CustomLayout.tsx"));
const Remote = lazy(() => import("./Remote.tsx"));
const Fetch = lazy(() => import("./Fetch.tsx"));
const Hoisted = lazy(() => import("./Hoisted.tsx"));
const OfficevibeTab = lazy(() => import("./OfficevibeTab.tsx"));
const SkillsTab = lazy(() => import("./SkillsTab.tsx"));
const ColoredPage = lazy(() => import("./ColoredPage.tsx"));

export const register: ModuleRegisterFunction<Runtime> = runtime => {
    runtime.registerRoutes([
        {
            path: "/remote",
            element: <Remote />
        },
        {
            path: "/fetch",
            element: <Fetch />,
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
            path: "/hoisted",
            element: <CustomLayout />,
            children: [
                {
                    index: true,
                    element: <Hoisted />
                }
            ]
        },
        {
            path: "/no-context-override",
            element: <ColoredPage />
        },
        {
            path: "/context-override",
            element: (
                <BackgroundColorContext.Provider value="red">
                    <ColoredPage />
                </BackgroundColorContext.Provider>
            )
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

    ///////

    runtime.registerRoutes([
        {
            path: "/federated-tabs/officevibe",
            element: <OfficevibeTab />
        },
        {
            path: "/federated-tabs/skills",
            element: <SkillsTab />
        }
    ], { layoutPath: "/federated-tabs" });

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
};
