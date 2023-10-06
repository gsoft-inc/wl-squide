import { createIndexKey } from "../src/routeRegistry.ts";
import { Runtime } from "../src/runtime.ts";

describe("createIndexKey", () => {
    test("when the route is an index route, return undefined", () => {
        const result = createIndexKey({
            index: true,
            element: <div>Hello!</div>
        });

        expect(result).toBeUndefined();
    });

    test("when the route has a path, return the route path", () => {
        const result1 = createIndexKey({
            path: "/nested",
            element: <div>Hello!</div>
        });

        expect(result1).toBe("/nested");

        const result2 = createIndexKey({
            path: "/parent/nested",
            element: <div>Hello!</div>
        });

        expect(result2).toBe("/parent/nested");
    });

    test("when the route has a path and the path ends with a separator, strip the separator", () => {
        const result = createIndexKey({
            path: "/parent/nested/",
            element: <div>Hello!</div>
        });

        expect(result).toBe("/parent/nested");
    });

    test("when the route has a name, return the route name", () => {
        const result = createIndexKey({
            name: "foo",
            element: <div>Hello!</div>
        });

        expect(result).toBe("foo");
    });

    test("when this a pathless route, return undefined", () => {
        const result = createIndexKey({
            element: <div>Hello!</div>
        });

        expect(result).toBeUndefined();
    });
});

describe("registerRoutes", () => {
    test("can register an index route", () => {
        const runtime = new Runtime();

        runtime.registerRoutes([
            {
                index: true,
                element: <div>Hello!</div>
            }
        ]);

        expect(runtime.routes.length).toBe(1);
        expect(runtime.routes[0].index).toBeTruthy();
    });

    test("can register a pathless route", () => {
        const runtime = new Runtime();

        runtime.registerRoutes([
            {
                element: <div>Hello!</div>
            }
        ]);

        expect(runtime.routes.length).toBe(1);
        expect(runtime.routes[0].index).toBeUndefined();
        expect(runtime.routes[0].path).toBeUndefined();
    });

    test("can register multiple pathless routes", () => {
        const runtime = new Runtime();

        runtime.registerRoutes([
            {
                element: <div>Hello!</div>
            },
            {
                element: <div>How</div>
            },
            {
                element: <div>Are</div>
            },
            {
                element: <div>You?</div>
            }
        ]);

        expect(runtime.routes.length).toBe(4);
    });

    test("can register a deeply nested route with pathless parent routes", () => {
        const runtime = new Runtime();

        runtime.registerRoutes([
            {
                element: <div>Hello</div>,
                children: [
                    {
                        element: <div>You!</div>,
                        children: [
                            {
                                path: "/deeply-nested-route",
                                element: <div>Hello from nested!</div>
                            }
                        ]
                    }
                ]
            }
        ]);

        expect(runtime.routes.length).toBe(1);
        expect(runtime.routes[0].children![0].children![0].path).toBe("/deeply-nested-route");
    });

    test("can register a deeply nested index route with pathless parent routes", () => {
        const runtime = new Runtime();

        runtime.registerRoutes([
            {
                element: <div>Hello</div>,
                children: [
                    {
                        element: <div>You!</div>,
                        children: [
                            {
                                index: true,
                                element: <div>Hello from nested!</div>
                            }
                        ]
                    }
                ]
            }
        ]);

        expect(runtime.routes.length).toBe(1);
        expect(runtime.routes[0].children![0].children![0].index).toBeTruthy();
    });

    test("can register an hoisted route", () => {
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
        expect(runtime.routes[0].hoist).toBeTruthy();
    });

    test("can register a route with a \"public\" visibility", () => {
        const runtime = new Runtime();

        runtime.registerRoutes([
            {
                path: "/public",
                element: <div>Hello!</div>,
                visibility: "public"
            }
        ]);

        expect(runtime.routes.length).toBe(1);
        expect(runtime.routes[0].path).toBe("/public");
        expect(runtime.routes[0].visibility).toBe("public");
    });

    test("can register a route with a \"authenticated\" visibility", () => {
        const runtime = new Runtime();

        runtime.registerRoutes([
            {
                path: "/authenticated",
                element: <div>Hello!</div>,
                visibility: "authenticated"
            }
        ]);

        expect(runtime.routes.length).toBe(1);
        expect(runtime.routes[0].path).toBe("/authenticated");
        expect(runtime.routes[0].visibility).toBe("authenticated");
    });

    test("can register a root route with a name", () => {
        const runtime = new Runtime();

        runtime.registerRoutes([
            {
                name: "foo",
                element: <div>Hello!</div>
            }
        ]);

        expect(runtime.routes.length).toBe(1);
        expect(runtime.routes[0].name).toBe("foo");
    });

    test("can register a nested route with a name", () => {
        const runtime = new Runtime();

        runtime.registerRoutes([
            {
                element: <div>Hello</div>,
                children: [
                    {
                        name: "foo",
                        element: <div>You!</div>
                    }
                ]
            }
        ]);

        expect(runtime.routes.length).toBe(1);
        expect(runtime.routes[0].children![0].name).toBe("foo");
    });

    describe("parentPath", () => {
        test("when the parent route has already been registered, register the nested route", () => {
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
            ], { parentPath: "/layout" });

            expect(runtime.routes.length).toBe(1);
            expect(runtime.routes[0].children![0].path).toBe("/layout/nested");
        });

        test("when the parent route has not been registered, do not register the nested route", () => {
            const runtime = new Runtime();

            runtime.registerRoutes([
                {
                    path: "/layout/nested",
                    element: <div>Hello!</div>
                }
            ], { parentPath: "/layout" });

            expect(runtime.routes.length).toBe(0);
        });

        test("when the parent route has not been registered, register the pending route once the parent route is registered", () => {
            const runtime = new Runtime();

            runtime.registerRoutes([
                {
                    path: "/layout/nested",
                    element: <div>Hello!</div>
                }
            ], { parentPath: "/layout" });

            runtime.registerRoutes([
                {
                    path: "/layout/another-nested",
                    element: <div>Hello!</div>
                }
            ], { parentPath: "/layout" });

            expect(runtime.routes.length).toBe(0);

            runtime.registerRoutes([
                {
                    path: "/foo",
                    element: <div>Hello!</div>
                }
            ]);

            expect(runtime.routes.length).toBe(1);
            expect(runtime.routes[0].children).toBeUndefined();

            runtime.registerRoutes([
                {
                    path: "/layout",
                    element: <div>Hello!</div>
                }
            ]);

            expect(runtime.routes.length).toBe(2);
            expect(runtime.routes[1].children?.length).toBe(2);
        });

        test("when the parent route has not been registered, and the parent route is nested in a pending registration single block, register the pending route once the parent route is registered", () => {
            const runtime = new Runtime();

            runtime.registerRoutes([
                {
                    path: "/layout/nested",
                    element: <div>Hello!</div>
                }
            ], { parentPath: "/layout" });

            expect(runtime.routes.length).toBe(0);

            runtime.registerRoutes([
                {
                    element: <div>Hello</div>,
                    children: [
                        {
                            element: <div>You!</div>,
                            children: [
                                {
                                    path: "/layout",
                                    element: <div>Hello from nested!</div>
                                }
                            ]
                        }
                    ]
                }
            ]);

            expect(runtime.routes.length).toBe(1);
            expect(runtime.routes[0].path).toBeUndefined();
            expect(runtime.routes[0].children![0].children![0].children![0].path).toBe("/layout/nested");
        });

        test("can register a route under a deeply nested layout", () => {
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
            ], { parentPath: "/layout" });

            runtime.registerRoutes([
                {
                    path: "/layout/nested/another-level",
                    element: <div>Hello!</div>
                }
            ], { parentPath: "/layout/nested" });

            expect(runtime.routes.length).toBe(1);
            expect(runtime.routes[0].children![0].children![0].path).toBe("/layout/nested/another-level");
        });

        test("can register a route under a deeply nested layout that has been registered in a single block", () => {
            const runtime = new Runtime();

            runtime.registerRoutes([
                {
                    element: <div>Hello</div>,
                    children: [
                        {
                            element: <div>You!</div>,
                            children: [
                                {
                                    path: "/deeply-nested-layout",
                                    element: <div>Hello from nested!</div>
                                }
                            ]
                        }
                    ]
                }
            ]);

            runtime.registerRoutes([
                {
                    path: "/deeply-nested-layout/another-level",
                    element: <div>Hello!</div>
                }
            ], { parentPath: "/deeply-nested-layout" });

            expect(runtime.routes.length).toBe(1);
            expect(runtime.routes[0].children![0].children![0].children![0].path).toBe("/deeply-nested-layout/another-level");

            runtime.registerRoutes([
                {
                    path: "/deeply-nested-layout/another-level/yet-another-level",
                    element: <div>Hello!</div>
                }
            ], { parentPath: "/deeply-nested-layout/another-level" });

            expect(runtime.routes.length).toBe(1);
            expect(runtime.routes[0].children![0].children![0].children![0].children![0].path).toBe("/deeply-nested-layout/another-level/yet-another-level");
        });

        test("when the specified parent path has a trailing separator but the parent route path doesn't have a trailing separator, the nested route is registered", () => {
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
            ], { parentPath: "/layout/" });

            expect(runtime.routes[0].children![0].path).toBe("/layout/nested");
        });

        test("when the specified parent path doesn't have a trailing separator but the parent route path have a trailing separator, the nested route is registered", () => {
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
            ], { parentPath: "/layout" });

            expect(runtime.routes[0].children![0].path).toBe("/layout/nested");
        });
    });

    describe("parentName", () => {
        test("when the parent route has already been registered, register the nested route", () => {
            const runtime = new Runtime();

            runtime.registerRoutes([
                {
                    name: "layout",
                    element: <div>Hello!</div>
                }
            ]);

            expect(runtime.routes.length).toBe(1);

            runtime.registerRoutes([
                {
                    path: "/layout/nested",
                    element: <div>Hello!</div>
                }
            ], { parentName: "layout" });

            expect(runtime.routes.length).toBe(1);
            expect(runtime.routes[0].children![0].path).toBe("/layout/nested");
        });

        test("when the parent route has not been registered, do not register the nested route", () => {
            const runtime = new Runtime();

            runtime.registerRoutes([
                {
                    path: "/layout/nested",
                    element: <div>Hello!</div>
                }
            ], { parentName: "layout" });

            expect(runtime.routes.length).toBe(0);
        });

        test("when the parent route has not been registered, register the pending route once the parent route is registered", () => {
            const runtime = new Runtime();

            runtime.registerRoutes([
                {
                    path: "/layout/nested",
                    element: <div>Hello!</div>
                }
            ], { parentName: "layout" });

            runtime.registerRoutes([
                {
                    path: "/layout/another-nested",
                    element: <div>Hello!</div>
                }
            ], { parentName: "layout" });

            expect(runtime.routes.length).toBe(0);

            runtime.registerRoutes([
                {
                    path: "/foo",
                    element: <div>Hello!</div>
                }
            ]);

            expect(runtime.routes.length).toBe(1);
            expect(runtime.routes[0].children).toBeUndefined();

            runtime.registerRoutes([
                {
                    name: "layout",
                    element: <div>Hello!</div>
                }
            ]);

            expect(runtime.routes.length).toBe(2);
            expect(runtime.routes[1].children?.length).toBe(2);
        });

        test("when the parent route has not been registered, and the parent route is nested in a pending registration single block, register the pending route once the parent route is registered", () => {
            const runtime = new Runtime();

            runtime.registerRoutes([
                {
                    path: "/layout/nested",
                    element: <div>Hello!</div>
                }
            ], { parentName: "layout" });

            expect(runtime.routes.length).toBe(0);

            runtime.registerRoutes([
                {
                    element: <div>Hello</div>,
                    children: [
                        {
                            element: <div>You!</div>,
                            children: [
                                {
                                    name: "layout",
                                    element: <div>Hello from nested!</div>
                                }
                            ]
                        }
                    ]
                }
            ]);

            expect(runtime.routes.length).toBe(1);
            expect(runtime.routes[0].path).toBeUndefined();
            expect(runtime.routes[0].children![0].children![0].children![0].path).toBe("/layout/nested");
        });

        test("can register a route under a deeply nested layout", () => {
            const runtime = new Runtime();

            runtime.registerRoutes([
                {
                    name: "layout",
                    element: <div>Hello!</div>
                }
            ]);

            runtime.registerRoutes([
                {
                    name: "layout-nested",
                    element: <div>Hello!</div>
                }
            ], { parentName: "layout" });

            runtime.registerRoutes([
                {
                    path: "/layout/nested/another-level",
                    element: <div>Hello!</div>
                }
            ], { parentName: "layout-nested" });

            expect(runtime.routes.length).toBe(1);
            expect(runtime.routes[0].children![0].children![0].path).toBe("/layout/nested/another-level");
        });

        test("can register a route under a deeply nested layout that has been registered in a single block", () => {
            const runtime = new Runtime();

            runtime.registerRoutes([
                {
                    element: <div>Hello</div>,
                    children: [
                        {
                            element: <div>You!</div>,
                            children: [
                                {
                                    name: "deeply-nested-layout",
                                    element: <div>Hello from nested!</div>
                                }
                            ]
                        }
                    ]
                }
            ]);

            runtime.registerRoutes([
                {
                    name: "deeply-nested-layout/another-level",
                    element: <div>Hello!</div>
                }
            ], { parentName: "deeply-nested-layout" });

            expect(runtime.routes.length).toBe(1);
            expect(runtime.routes[0].children![0].children![0].children![0].name).toBe("deeply-nested-layout/another-level");

            runtime.registerRoutes([
                {
                    path: "/deeply-nested-layout/another-level/yet-another-level",
                    element: <div>Hello!</div>
                }
            ], { parentName: "deeply-nested-layout/another-level" });

            expect(runtime.routes.length).toBe(1);
            expect(runtime.routes[0].children![0].children![0].children![0].children![0].path).toBe("/deeply-nested-layout/another-level/yet-another-level");
        });
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

        expect(runtime.getNavigationItems("section-menu")[0].label).toBe("Section");
    });
});

describe("_completeRegistration", () => {
    describe("parentPath", () => {
        test("when the registration is completed and there are no pending registrations, do nothing", () => {
            const runtime = new Runtime();

            runtime.registerRoutes([
                {
                    path: "/layout/nested",
                    element: <div>Hello!</div>
                }
            ], { parentPath: "/layout" });

            runtime.registerRoutes([
                {
                    path: "/layout",
                    element: <div>Hello!</div>
                }
            ]);

            expect(() => runtime._completeRegistration()).not.toThrow();
        });

        test("when the registration is completed and there are pending registrations, throw an error", () => {
            const runtime = new Runtime();

            runtime.registerRoutes([
                {
                    path: "/layout/nested",
                    element: <div>Hello!</div>
                }
            ], { parentPath: "/layout" });

            expect(() => runtime._completeRegistration()).toThrow();
        });
    });

    describe("parentName", () => {
        test("when the registration is completed and there are no pending registrations, do nothing", () => {
            const runtime = new Runtime();

            runtime.registerRoutes([
                {
                    path: "/layout/nested",
                    element: <div>Hello!</div>
                }
            ], { parentName: "layout" });

            runtime.registerRoutes([
                {
                    name: "layout",
                    element: <div>Hello!</div>
                }
            ]);

            expect(() => runtime._completeRegistration()).not.toThrow();
        });

        test("when the registration is completed and there are pending registrations, throw an error", () => {
            const runtime = new Runtime();

            runtime.registerRoutes([
                {
                    path: "/layout/nested",
                    element: <div>Hello!</div>
                }
            ], { parentName: "layout" });

            expect(() => runtime._completeRegistration()).toThrow();
        });
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

        expect(runtime.getNavigationItems("menu-1")[0].to).toBe("/item-4");
    });
});
