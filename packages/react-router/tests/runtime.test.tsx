import { createIndexKey } from "../src/routeRegistry.ts";
import { Runtime } from "../src/runtime.ts";

/*
- "when the route is not an index route and the path ends with a separator, strip the separator"
*/

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

/*
- "can register a nested route for an index route"
- "can register a nested route for the root index route"
*/

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

    test("when the parent route has already been registered, register the nested route", () => {
        const runtime = new Runtime();

        runtime.registerRoutes([
            {
                path: "/parent",
                element: <div>Hello!</div>
            }
        ]);

        expect(runtime.routes.length).toBe(1);

        runtime.registerRoutes([
            {
                path: "/parent/nested",
                element: <div>Hello!</div>
            }
        ], { parentPath: "/parent" });

        expect(runtime.routes.length).toBe(1);
        expect(runtime.routes[0].children).toBeDefined();
        expect(runtime.routes[0].children?.length).toBe(1);
    });

    test("when the parent route has not already been registered, do not register the nested route", () => {
        const runtime = new Runtime();

        expect(() => runtime.registerRoutes([
            {
                path: "/parent/nested",
                element: <div>Hello!</div>
            }
        ], { parentPath: "/parent" })).toThrow();
    });

    test("can register a deeply nested route", () => {
        const runtime = new Runtime();

        runtime.registerRoutes([
            {
                path: "/parent",
                element: <div>Hello!</div>
            }
        ]);

        runtime.registerRoutes([
            {
                path: "/parent/nested",
                element: <div>Hello!</div>
            }
        ], { parentPath: "/parent" });

        runtime.registerRoutes([
            {
                path: "/parent/nested/another-level",
                element: <div>Hello!</div>
            }
        ], { parentPath: "/parent/nested" });

        expect(runtime.routes.length).toBe(1);
        expect(runtime.routes[0].children![0].children).toBeDefined();
        expect(runtime.routes[0].children![0].children?.length).toBe(1);
    });

    test("when the parent path has a trailing separator but the parent route path doesn't have a trailing separator, the nested route is registered", () => {
        const runtime = new Runtime();

        runtime.registerRoutes([
            {
                path: "/parent",
                element: <div>Hello!</div>
            }
        ]);

        runtime.registerRoutes([
            {
                path: "/parent/nested",
                element: <div>Hello!</div>
            }
        ], { parentPath: "/parent/" });

        expect(runtime.routes[0].children).toBeDefined();
        expect(runtime.routes[0].children!.length).toBe(1);
    });

    test("when the parent path doesn't have a trailing separator but the parent route path have a trailing separator, the nested route is registered", () => {
        const runtime = new Runtime();

        runtime.registerRoutes([
            {
                path: "/parent/",
                element: <div>Hello!</div>
            }
        ]);

        runtime.registerRoutes([
            {
                path: "/parent/nested",
                element: <div>Hello!</div>
            }
        ], { parentPath: "/parent" });

        expect(runtime.routes[0].children).toBeDefined();
        expect(runtime.routes[0].children!.length).toBe(1);
    });

    test("can register a nested route for an index parent route", () => {
        const runtime = new Runtime();

        runtime.registerRoutes([
            {
                path: "/parent",
                element: <div>Hello!</div>
            }
        ]);

        runtime.registerRoutes([
            {
                index: true,
                element: <div>Hello!</div>
            }
        ], { parentPath: "/parent" });

        runtime.registerRoutes([
            {
                path: "/parent/another-level",
                element: <div>Hello!</div>
            }
        ], { parentPath: "/parent/$index$" });

        expect(runtime.routes[0].children![0].children).toBeDefined();
        expect(runtime.routes[0].children![0].children?.length).toBe(1);
        expect(runtime.routes[0].children![0].children![0].path).toBe("/parent/another-level");
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
        ], { parentPath: "/$index$" });

        expect(runtime.routes[0].children).toBeDefined();
        expect(runtime.routes[0].children?.length).toBe(1);
        expect(runtime.routes[0].children![0].path).toBe("/nested");
    });
});

/*
- can register a root navigation item
- can register a navigation item for a specific menu id
*/

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

    test("ca register a navigation section for a specific menu id", () => {
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
