import type { ModuleRegisterFunction, Runtime } from "@squide/react-router";

import { lazy } from "react";

const CustomLayout = lazy(() => import("./CustomLayout.tsx"));
const Remote = lazy(() => import("./Remote.tsx"));
const Fetch = lazy(() => import("./Fetch.tsx"));
const Hoisted = lazy(() => import("./Hoisted.tsx"));

export const register: ModuleRegisterFunction = (runtime: Runtime) => {
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
            label: <strong>Hoisted</strong>
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
        }
    ]);
};
