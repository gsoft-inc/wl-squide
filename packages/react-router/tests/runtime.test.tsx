import { createIndexKey, type Route } from "../src/routeRegistry.ts";
import { Runtime } from "../src/runtime.ts";

function DummyComponent() {
    return (
        <div>I am a dummy component!</div>
    );
}

describe("createIndexKey", () => {
    /*
    TODO: same segment twice?!?! (not sure if this is an actual valid case)
    */

    test("when the route is an index route, append \"index\" to the parent path", () => {
        const result1 = createIndexKey({
            index: true,
            element: <DummyComponent />
        }, "/");

        expect(result1).toBe("/$index$");

        const result2 = createIndexKey({
            index: true,
            element: <DummyComponent />
        }, "/parent");

        expect(result2).toBe("/parent/$index$");
    });

    test("when the route is not an index route, append the route path to the parent path", () => {
        const result1 = createIndexKey({
            path: "/nested",
            element: <DummyComponent />
        }, "/");

        expect(result1).toBe("/nested");

        const result2 = createIndexKey({
            path: "/nested",
            element: <DummyComponent />
        }, "/parent");

        expect(result2).toBe("/parent/nested");
    });

    test("add a separator between both paths", () => {
        const result1 = createIndexKey({
            path: "nested",
            element: <DummyComponent />
        }, "/");

        expect(result1).toBe("/nested");

        const result2 = createIndexKey({
            path: "nested",
            element: <DummyComponent />
        }, "/parent");

        expect(result2).toBe("/parent/nested");
    });

    test("when the parent path ends with a \"/\", do not add an additional separator between both paths", () => {
        const result1 = createIndexKey({
            path: "nested",
            element: <DummyComponent />
        }, "/");

        expect(result1).toBe("/nested");

        const result2 = createIndexKey({
            path: "nested",
            element: <DummyComponent />
        }, "/parent/");

        expect(result2).toBe("/parent/nested");
    });

    test("when the nested route path starts with a \"/\", do not add an additional separator between both paths", () => {
        const result = createIndexKey({
            path: "/nested",
            element: <DummyComponent />
        }, "/parent");

        expect(result).toBe("/parent/nested");
    });

    test("when the parent path ends with a separator and the route path starts with a separator, remove the route path separator", () => {
        const result1 = createIndexKey({
            path: "/nested",
            element: <DummyComponent />
        }, "/");

        expect(result1).toBe("/nested");

        const result2 = createIndexKey({
            path: "/nested",
            element: <DummyComponent />
        }, "/parent/");

        expect(result2).toBe("/parent/nested");
    });

    test("when the route path already includes the parent path, do not concatenate the paths", () => {
        const result = createIndexKey({
            path: "/parent/nested",
            element: <DummyComponent />
        }, "/parent");

        expect(result).toBe("/parent/nested");
    });

    test("when the route path ends with a separator, strip the separator", () => {
        const result1 = createIndexKey({
            path: "/nested/",
            element: <DummyComponent />
        }, "/");

        expect(result1).toBe("/nested");

        const result2 = createIndexKey({
            path: "/nested/",
            element: <DummyComponent />
        }, "/parent");

        expect(result2).toBe("/parent/nested");
    });
});

describe("registerRoutes", () => {
    test("can register a root route", () => {
        const runtime = new Runtime();

        runtime.registerRoutes([
            {
                path: "/root",
                element: <DummyComponent />,
                hoist: true
            }
        ]);

        expect(runtime.routes.length).toBe(1);
        expect(runtime.routes[0].path).toBe("/root");
    });

    test("when the parent route has already been registered, do not register the nested route", () => {
        const runtime = new Runtime();

        runtime.registerRoutes([
            {
                path: "/parent",
                element: <DummyComponent />
            }
        ]);

        expect(runtime.routes.length).toBe(1);

        runtime.registerRoutes([
            {
                path: "/nested",
                element: <DummyComponent />
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
                path: "/nested",
                element: <DummyComponent />
            }
        ], { parentPath: "/parent" })).toThrow();
    });

    test("can register a deeply nested route", () => {
        const runtime = new Runtime();

        runtime.registerRoutes([
            {
                path: "/parent",
                element: <DummyComponent />
            }
        ]);

        runtime.registerRoutes([
            {
                path: "/nested",
                element: <DummyComponent />
            }
        ], { parentPath: "/parent" });

        runtime.registerRoutes([
            {
                path: "/another-level",
                element: <DummyComponent />
            }
        ], { parentPath: "/parent/nested" });

        expect(runtime.routes.length).toBe(1);
        expect(runtime.routes[0].children![0].children).toBeDefined();
        expect(runtime.routes[0].children![0].children?.length).toBe(1);
    });

    test("when the nested route path do not includes the parent path, concatenate the paths", () => {
        const runtime = new Runtime();

        runtime.registerRoutes([
            {
                path: "/parent",
                element: <DummyComponent />
            }
        ]);

        runtime.registerRoutes([
            {
                path: "/nested",
                element: <DummyComponent />
            }
        ], { parentPath: "/parent" });

        expect(runtime.routes[0].children![0].path).toBe("/parent/nested");

        runtime.registerRoutes([
            {
                path: "/another-level",
                element: <DummyComponent />
            }
        ], { parentPath: "/parent/nested" });

        expect(runtime.routes[0].children![0].children![0].path).toBe("/parent/nested/another-level");

        runtime.registerRoutes([
            {
                path: "/",
                element: <DummyComponent />
            }
        ]);

        runtime.registerRoutes([
            {
                path: "nested",
                element: <DummyComponent />
            }
        ], { parentPath: "/" });

        expect(runtime.routes[1].children![0].path).toBe("/nested");
    });

    test("when the nested route path already includes the parent path, do not concatenate the paths", () => {
        const runtime = new Runtime();

        runtime.registerRoutes([
            {
                path: "/parent",
                element: <DummyComponent />
            }
        ]);

        runtime.registerRoutes([
            {
                path: "/parent/nested",
                element: <DummyComponent />
            }
        ], { parentPath: "/parent" });

        expect(runtime.routes[0].children![0].path).toBe("/parent/nested");

        runtime.registerRoutes([
            {
                path: "/parent/nested/another-level",
                element: <DummyComponent />
            }
        ], { parentPath: "/parent/nested" });

        expect(runtime.routes[0].children![0].children![0].path).toBe("/parent/nested/another-level");

        runtime.registerRoutes([
            {
                path: "/",
                element: <DummyComponent />
            }
        ]);

        runtime.registerRoutes([
            {
                path: "/nested",
                element: <DummyComponent />
            }
        ], { parentPath: "/" });

        expect(runtime.routes[1].children![0].path).toBe("/nested");
    });

    test("when the nested route is an index route, do not set a path", () => {
        const runtime = new Runtime();

        runtime.registerRoutes([
            {
                path: "/parent",
                element: <DummyComponent />
            }
        ]);

        runtime.registerRoutes([
            {
                index: true,
                element: <DummyComponent />
            }
        ], { parentPath: "/parent" });

        expect(runtime.routes[0].children![0].path).toBeUndefined();
        expect(runtime.routes[0].children![0].index).toBeTruthy();
    });

    test("add a separator between both paths", () => {
        const runtime = new Runtime();

        runtime.registerRoutes([
            {
                path: "/parent",
                element: <DummyComponent />
            }
        ]);

        runtime.registerRoutes([
            {
                path: "/nested",
                element: <DummyComponent />
            }
        ], { parentPath: "/parent" });

        expect(runtime.routes[0].children![0].path).toBe("/parent/nested");

        runtime.registerRoutes([
            {
                path: "/",
                element: <DummyComponent />
            }
        ]);

        runtime.registerRoutes([
            {
                path: "/nested",
                element: <DummyComponent />
            }
        ], { parentPath: "/" });

        expect(runtime.routes[1].children![0].path).toBe("/nested");
    });

    test("when the parent path ends with a \"/\", do not add an additional separator between both paths", () => {
        const runtime = new Runtime();

        runtime.registerRoutes([
            {
                path: "/parent",
                element: <DummyComponent />
            }
        ]);

        runtime.registerRoutes([
            {
                path: "nested",
                element: <DummyComponent />
            }
        ], { parentPath: "/parent/" });

        expect(runtime.routes[0].children![0].path).toBe("/parent/nested");

        runtime.registerRoutes([
            {
                path: "/",
                element: <DummyComponent />
            }
        ]);

        runtime.registerRoutes([
            {
                path: "nested",
                element: <DummyComponent />
            }
        ], { parentPath: "/" });

        expect(runtime.routes[1].children![0].path).toBe("/nested");
    });

    test("when the nested route path starts with a \"/\", do not add an additional separator between both paths", () => {
        const runtime = new Runtime();

        runtime.registerRoutes([
            {
                path: "/parent",
                element: <DummyComponent />
            }
        ]);

        runtime.registerRoutes([
            {
                path: "/nested",
                element: <DummyComponent />
            }
        ], { parentPath: "/parent" });

        expect(runtime.routes[0].children![0].path).toBe("/parent/nested");
    });


    test("when the parent path ends with a separator and the route path starts with a separator, remove the route path separator", () => {
        const runtime = new Runtime();

        runtime.registerRoutes([
            {
                path: "/parent/",
                element: <DummyComponent />
            }
        ]);

        runtime.registerRoutes([
            {
                path: "/nested",
                element: <DummyComponent />
            }
        ], { parentPath: "/parent" });

        expect(runtime.routes[0].children![0].path).toBe("/parent/nested");

        runtime.registerRoutes([
            {
                path: "/",
                element: <DummyComponent />
            }
        ]);

        runtime.registerRoutes([
            {
                path: "/nested",
                element: <DummyComponent />
            }
        ], { parentPath: "/" });

        expect(runtime.routes[1].children![0].path).toBe("/nested");
    });

    test("when the nested route path ends with a separator, strip the separator", () => {
        const runtime = new Runtime();

        runtime.registerRoutes([
            {
                path: "/parent",
                element: <DummyComponent />
            }
        ]);

        runtime.registerRoutes([
            {
                path: "/nested/",
                element: <DummyComponent />
            }
        ], { parentPath: "/parent" });

        expect(runtime.routes[0].children![0].path).toBe("/parent/nested");
    });

    test("can register a nested route for an index route", () => {
        const runtime = new Runtime();

        runtime.registerRoutes([
            {
                path: "/parent",
                element: <DummyComponent />
            }
        ]);

        runtime.registerRoutes([
            {
                index: true,
                element: <DummyComponent />
            }
        ], { parentPath: "/parent" });

        runtime.registerRoutes([
            {
                path: "another-level",
                element: <DummyComponent />
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
                element: <DummyComponent />
            }
        ]);

        runtime.registerRoutes([
            {
                path: "nested",
                element: <DummyComponent />
            }
        ], { parentPath: "/$index$" });

        expect(runtime.routes[0].children).toBeDefined();
        expect(runtime.routes[0].children?.length).toBe(1);
        expect(runtime.routes[0].children![0].path).toBe("/nested");
    });
});

// describe("registerNavigationItems", () => {
// });
