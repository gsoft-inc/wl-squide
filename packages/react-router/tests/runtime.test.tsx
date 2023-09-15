import { createIndexKey } from "../src/routeRegistry.ts";
import { Runtime } from "../src/runtime.ts";

describe("createIndexKey", () => {
    test("when the route is an index route, append \"index\" to the parent path", () => {
        const result1 = createIndexKey({
            index: true,
            element: <div>Hello!</div>
        }, "/");

        expect(result1).toBe("/$index$");

        const result2 = createIndexKey({
            index: true,
            element: <div>Hello!</div>
        }, "/parent");

        expect(result2).toBe("/parent/$index$");
    });

    test("when the route is not an index route, return the route path", () => {
        const result1 = createIndexKey({
            path: "/nested",
            element: <div>Hello!</div>
        }, "/");

        expect(result1).toBe("/nested");

        const result2 = createIndexKey({
            path: "/parent/nested",
            element: <div>Hello!</div>
        }, "/parent");

        expect(result2).toBe("/parent/nested");
    });

    test("when the route is not an index route and the path ends with a separator, strip the separator", () => {
        const result = createIndexKey({
            path: "/parent/nested/",
            element: <div>Hello!</div>
        }, "/parent");

        expect(result).toBe("/parent/nested");
    });
});

describe("registerRoutes", () => {
    test("can register a root route", () => {
        const runtime = new Runtime();

        runtime.registerRoutes([
            {
                path: "/root",
                element: <div>Hello!</div>,
                hoist: true
            }
        ]);

        expect(runtime.routes.length).toBe(1);
        expect(runtime.routes[0].path).toBe("/root");
    });

    test("when the layout route has already been registered, register the nested route", () => {
        const runtime = new Runtime();

        runtime.registerRoutes([
            {
                path: "/layout",
                element: <div>Hello!</div>
            }
        ]);

        expect(runtime.routes.length).toBe(1);

        runtime.registerRoutes([
            {
                path: "/layout/nested",
                element: <div>Hello!</div>
            }
        ], { layoutPath: "/layout" });

        expect(runtime.routes.length).toBe(1);
        expect(runtime.routes[0].children).toBeDefined();
        expect(runtime.routes[0].children?.length).toBe(1);
    });

    test("when the layout route has not been registered, do not register the nested route", () => {
        const runtime = new Runtime();

        runtime.registerRoutes([
            {
                path: "/layout/nested",
                element: <div>Hello!</div>
            }
        ], { layoutPath: "/layout" });

        expect(runtime.routes.length).toBe(0);
    });

    test("when the layout route has not been registered, register the pending route once the layout route is registered", () => {
        const runtime = new Runtime();

        runtime.registerRoutes([
            {
                path: "/layout/nested",
                element: <div>Hello!</div>
            }
        ], { layoutPath: "/layout" });

        expect(runtime.routes.length).toBe(0);

        runtime.registerRoutes([
            {
                path: "/layout",
                element: <div>Hello!</div>
            }
        ]);

        expect(runtime.routes.length).toBe(1);
        expect(runtime.routes[0].children).toBeDefined();
        expect(runtime.routes[0].children?.length).toBe(1);
    });

    test("can register a deeply nested route", () => {
        const runtime = new Runtime();

        runtime.registerRoutes([
            {
                path: "/layout",
                element: <div>Hello!</div>
            }
        ]);

        runtime.registerRoutes([
            {
                path: "/layout/nested",
                element: <div>Hello!</div>
            }
        ], { layoutPath: "/layout" });

        runtime.registerRoutes([
            {
                path: "/layout/nested/another-level",
                element: <div>Hello!</div>
            }
        ], { layoutPath: "/layout/nested" });

        expect(runtime.routes.length).toBe(1);
        expect(runtime.routes[0].children![0].children).toBeDefined();
        expect(runtime.routes[0].children![0].children?.length).toBe(1);
    });

    test("when the layout path has a trailing separator but the layout route path doesn't have a trailing separator, the nested route is registered", () => {
        const runtime = new Runtime();

        runtime.registerRoutes([
            {
                path: "/layout",
                element: <div>Hello!</div>
            }
        ]);

        runtime.registerRoutes([
            {
                path: "/layout/nested",
                element: <div>Hello!</div>
            }
        ], { layoutPath: "/layout/" });

        expect(runtime.routes[0].children).toBeDefined();
        expect(runtime.routes[0].children!.length).toBe(1);
    });

    test("when the layout path doesn't have a trailing separator but the layout route path have a trailing separator, the nested route is registered", () => {
        const runtime = new Runtime();

        runtime.registerRoutes([
            {
                path: "/layout/",
                element: <div>Hello!</div>
            }
        ]);

        runtime.registerRoutes([
            {
                path: "/layout/nested",
                element: <div>Hello!</div>
            }
        ], { layoutPath: "/layout" });

        expect(runtime.routes[0].children).toBeDefined();
        expect(runtime.routes[0].children!.length).toBe(1);
    });

    test("can register a nested route for an index layout route", () => {
        const runtime = new Runtime();

        runtime.registerRoutes([
            {
                path: "/layout",
                element: <div>Hello!</div>
            }
        ]);

        runtime.registerRoutes([
            {
                index: true,
                element: <div>Hello!</div>
            }
        ], { layoutPath: "/layout" });

        runtime.registerRoutes([
            {
                path: "/layout/another-level",
                element: <div>Hello!</div>
            }
        ], { layoutPath: "/layout/$index$" });

        expect(runtime.routes[0].children![0].children).toBeDefined();
        expect(runtime.routes[0].children![0].children?.length).toBe(1);
        expect(runtime.routes[0].children![0].children![0].path).toBe("/layout/another-level");
    });

    test("can register a nested route for the root index route", () => {
        const runtime = new Runtime();

        runtime.registerRoutes([
            {
                index: true,
                element: <div>Hello!</div>
            }
        ]);

        runtime.registerRoutes([
            {
                path: "/nested",
                element: <div>Hello!</div>
            }
        ], { layoutPath: "/$index$" });

        expect(runtime.routes[0].children).toBeDefined();
        expect(runtime.routes[0].children?.length).toBe(1);
        expect(runtime.routes[0].children![0].path).toBe("/nested");
    });
});

describe("registerNavigationItems", () => {
    test("can register a root navigation link", () => {
        const runtime = new Runtime();

        runtime.registerNavigationItems([
            {
                to: "/root",
                label: "Root"
            }
        ]);

        expect(runtime.getNavigationItems().length).toBe(1);
        expect(runtime.getNavigationItems()[0].to).toBe("/root");
    });

    test("can register a root navigation section", () => {
        const runtime = new Runtime();

        runtime.registerNavigationItems([
            {
                label: "Section",
                children: [
                    {
                        to: "/child",
                        label: "Child"
                    }
                ]
            }
        ]);

        expect(runtime.getNavigationItems().length).toBe(1);
        expect(runtime.getNavigationItems()[0].label).toBe("Section");
    });

    test("can register a navigation link for a specific menu id", () => {
        const runtime = new Runtime();

        runtime.registerNavigationItems([
            {
                to: "/link",
                label: "Link"
            }
        ], { menuId: "link-menu" });

        expect(runtime.getNavigationItems("link-menu").length).toBe(1);
        expect(runtime.getNavigationItems("link-menu")[0].to).toBe("/link");
    });

    test("can register a navigation section for a specific menu id", () => {
        const runtime = new Runtime();

        runtime.registerNavigationItems([
            {
                label: "Section",
                children: [
                    {
                        to: "/child",
                        label: "Child"
                    }
                ]
            }
        ], { menuId: "section-menu" });

        expect(runtime.getNavigationItems("section-menu").length).toBe(1);
        expect(runtime.getNavigationItems("section-menu")[0].label).toBe("Section");
    });
});

describe("getNavigationItems", () => {
    test("when no menu id is specified, returns all the registered navigation items for the root menu", () => {
        const runtime = new Runtime();

        runtime.registerNavigationItems([
            {
                to: "/item-1",
                label: "Item 1"
            },
            {
                to: "/item-2",
                label: "Item 2"
            }
        ]);

        runtime.registerNavigationItems([
            {
                to: "/item-3",
                label: "Item 3"
            }
        ]);

        runtime.registerNavigationItems([
            {
                to: "/item-4",
                label: "Item 4"
            }
        ], { menuId: "menu-1" });

        runtime.registerNavigationItems([
            {
                to: "/item-5",
                label: "Item 5"
            }
        ], { menuId: "menu-2" });

        expect(runtime.getNavigationItems().length).toBe(3);
        expect(runtime.getNavigationItems()[0].to).toBe("/item-1");
        expect(runtime.getNavigationItems()[1].to).toBe("/item-2");
        expect(runtime.getNavigationItems()[2].to).toBe("/item-3");
    });

    test("when no menu id is specified, returns all the registered navigation items for that specific menu", () => {
        const runtime = new Runtime();

        runtime.registerNavigationItems([
            {
                to: "/item-1",
                label: "Item 1"
            },
            {
                to: "/item-2",
                label: "Item 2"
            }
        ]);

        runtime.registerNavigationItems([
            {
                to: "/item-3",
                label: "Item 3"
            }
        ]);

        runtime.registerNavigationItems([
            {
                to: "/item-4",
                label: "Item 4"
            }
        ], { menuId: "menu-1" });

        runtime.registerNavigationItems([
            {
                to: "/item-5",
                label: "Item 5"
            }
        ], { menuId: "menu-2" });

        expect(runtime.getNavigationItems("menu-1").length).toBe(1);
        expect(runtime.getNavigationItems("menu-1")[0].to).toBe("/item-4");
    });
});
