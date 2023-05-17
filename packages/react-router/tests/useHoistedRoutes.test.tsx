import { type RootRoute, type Route } from "../src/routeRegistry.ts";

import { renderHook } from "@testing-library/react";
import { type UseHoistedRoutesOptions, useHoistedRoutes } from "../src/useHoistedRoutes.ts";

test("hoisted routes are at the root", () => {
    const routes: RootRoute[] = [
        { path: "/foo", element: <div>Foo</div> },
        { path: "/hoisted", element: <div>Hoisted</div>, hoist: true }
    ];

    const wrapManagedRoutes = (managedRoutes: Route[]) => {
        return {
            path: "/wrapper",
            children: [
                ...managedRoutes
            ]
        };
    };

    const { result } = renderHook(({ routes: x, wrapManagedRoutes: y }) => useHoistedRoutes(x, y), {
        initialProps: { routes, wrapManagedRoutes }
    });

    expect(result.current.length).toBe(2);
    expect(result.current[0].path).toBe("/hoisted");
});

test("managed routes are wrapped", () => {
    const routes: RootRoute[] = [
        { path: "/foo", element: <div>Foo</div> },
        { path: "/hoisted", element: <div>Hoisted</div>, hoist: true }
    ];

    const wrapManagedRoutes = (managedRoutes: Route[]) => {
        return {
            path: "/wrapper",
            children: [
                ...managedRoutes
            ]
        };
    };

    const { result } = renderHook(({ routes: x, wrapManagedRoutes: y }) => useHoistedRoutes(x, y), {
        initialProps: {
            routes,
            wrapManagedRoutes
        }
    });

    expect(result.current.length).toBe(2);
    expect(result.current[1].path).toBe("/wrapper");
    // eslint-disable-next-line testing-library/no-node-access
    expect(result.current[1].children![0].path).toBe("/foo");
});

test("when a restricted route is hoisted, throw an error", () => {
    // Prevent the expected exception from printing in the console.
    jest.spyOn(console, "error").mockImplementation(jest.fn());

    const routes: RootRoute[] = [
        { path: "/foo", element: <div>Foo</div> },
        { path: "/hoisted", element: <div>Hoisted</div>, hoist: true },
        { path: "/bar", element: <div>Bar</div>, hoist: true }
    ];

    const wrapManagedRoutes = (managedRoutes: Route[]) => {
        return {
            path: "/wrapper",
            children: [
                ...managedRoutes
            ]
        };
    };

    expect(() => renderHook(({ routes: x, wrapManagedRoutes: y, options }) => useHoistedRoutes(x, y, options), {
        initialProps: {
            routes,
            wrapManagedRoutes,
            options: {
                allowedPaths: [
                    "/hoisted"
                ]
            } as UseHoistedRoutesOptions
        }
    })).toThrow(/\/bar/);
});

test("returned array is immutable", () => {
    const routes: RootRoute[] = [
        { path: "/foo", element: <div>Foo</div> },
        { path: "/hoisted", element: <div>Hoisted</div>, hoist: true }
    ];

    const wrapManagedRoutes = (managedRoutes: Route[]) => {
        return {
            path: "/wrapper",
            children: [
                ...managedRoutes
            ]
        };
    };

    const { result, rerender } = renderHook(({ routes: x, wrapManagedRoutes: y }) => useHoistedRoutes(x, y), {
        initialProps: {
            routes,
            wrapManagedRoutes
        }
    });

    const array1 = result.current;

    // Haven't updated the routes, the returned array should be "array1".
    rerender({
        routes,
        wrapManagedRoutes
    });

    const array2 = result.current;

    rerender({
        routes: [...routes, { path: "/bar", element: <div>Bar</div> }],
        wrapManagedRoutes
    });

    const array3 = result.current;

    expect(array1).toEqual(array2);
    expect(array1).not.toEqual(array3);
});
