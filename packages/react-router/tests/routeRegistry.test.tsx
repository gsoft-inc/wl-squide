import { RouteRegistry, createIndexKey } from "../src/routeRegistry.ts";

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
            $name: "foo",
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

describe("add", () => {
    test("when a root route is added, return the \"registered\" registration status", () => {
        const registry = new RouteRegistry();

        const result = registry.add({
            path: "/root",
            element: <div>Hello</div>
        }, {
            hoist: true
        });

        expect(result.registrationStatus).toBe("registered");
    });

    test("when a root route is added and complete the pending registration of nested routes, add the registered routes to the returned \"completedPendingRegistrations\" array", () => {
        const registry = new RouteRegistry();

        registry.add({
            path: "/root/another-level-1",
            element: <div>Hello</div>
        }, {
            parentPath: "/root"
        });

        registry.add({
            path: "/root/another-level-2",
            element: <div>Hello</div>
        }, {
            parentPath: "/root"
        });

        const result = registry.add({
            path: "/root",
            element: <div>Hello</div>
        }, {
            hoist: true
        });

        expect(result.completedPendingRegistrations![0].path).toBe("/root/another-level-1");
        expect(result.completedPendingRegistrations![1].path).toBe("/root/another-level-2");
    });

    test("when a root route is added and do not complete any pending registration, return an empty \"completedPendingRegistrations\" array", () => {
        const registry = new RouteRegistry();

        registry.add({
            path: "/root/another-level-1",
            element: <div>Hello</div>
        }, {
            parentPath: "/root"
        });

        registry.add({
            path: "/root/another-level-2",
            element: <div>Hello</div>
        }, {
            parentPath: "/root"
        });

        const result = registry.add({
            path: "/toto",
            element: <div>Hello</div>
        }, {
            hoist: true
        });

        expect(result.completedPendingRegistrations!.length).toBe(0);
    });

    test("when a nested route is pending for registration, return the \"pending\" registration status", () => {
        const registry = new RouteRegistry();

        const result = registry.add({
            path: "/root/another-level",
            element: <div>Hello</div>
        }, {
            parentPath: "/root"
        });

        expect(result.registrationStatus).toBe("pending");
    });

    test("when a nested route is registred, return the \"registered\" registration status", () => {
        const registry = new RouteRegistry();

        registry.add({
            path: "/root",
            element: <div>Hello</div>
        }, {
            hoist: true
        });

        const result = registry.add({
            path: "/root/another-level",
            element: <div>Hello</div>
        }, {
            parentPath: "/root"
        });

        expect(result.registrationStatus).toBe("registered");
    });

    test("when a nested route is added and complete the pending registration of nested routes, add the registered routes to the returned \"completedPendingRegistrations\" array", () => {
        const registry = new RouteRegistry();

        registry.add({
            path: "/root/another-level-1",
            element: <div>Hello</div>
        }, {
            parentPath: "/root/another-level/yet-another-level"
        });

        registry.add({
            path: "/root/another-level-2",
            element: <div>Hello</div>
        }, {
            parentPath: "/root/another-level/yet-another-level"
        });

        registry.add({
            path: "/root",
            element: <div>Hello</div>
        }, {
            hoist: true
        });

        const result = registry.add({
            path: "/root/another-level/yet-another-level",
            element: <div>Hello</div>
        }, {
            parentPath: "/root"
        });

        expect(result.completedPendingRegistrations![0].path).toBe("/root/another-level-1");
        expect(result.completedPendingRegistrations![1].path).toBe("/root/another-level-2");
    });
});
