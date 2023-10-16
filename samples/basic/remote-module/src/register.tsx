import { BackgroundColorContext } from "@basic/shared";
import type { ModuleRegisterFunction, Runtime } from "@squide/react-router";

function registerRoutes(runtime: Runtime) {
    runtime.registerRoute({
        path: "/hoisted",
        lazy: () => import("./CustomLayout.tsx"),
        children: [
            {
                index: true,
                lazy: () => import("./HoistedPage.tsx")
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
        $label: <span style={{ backgroundColor: "green", color: "white" }}>Hoisted</span>,
        to: "/hoisted"
    });

    runtime.registerNavigationItem({
        $label: "Section",
        $priority: -30,
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
        $priority: -20,
        to: "/no-context-override"
    });

    runtime.registerNavigationItem({
        $label: "Context override",
        $priority: -10,
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

export const register: ModuleRegisterFunction<Runtime> = runtime => {
    registerRoutes(runtime);
};
