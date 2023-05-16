import type { RootRoute, Route } from "../src/routeRegistry.ts";

import { renderHook } from "@testing-library/react";
import { useHoistedRoutes } from "../src/useHoistedRoutes.ts";

// when a restricted route is hoisted, throw an error

// returned array is immutable

test("hoisted routes are at the root of the returned tree", () => {
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

test("managed routes are rendered as children of the wrapper", () => {
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
    expect(result.current[1].path).toBe("/wrapper");
    // eslint-disable-next-line testing-library/no-node-access
    expect(result.current[1].children![0].path).toBe("/foo");
});


