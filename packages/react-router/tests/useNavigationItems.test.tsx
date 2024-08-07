import { RuntimeContext } from "@squide/core";
import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { ReactRouterRuntime } from "../src/reactRouterRuntime.ts";
import { useRuntimeNavigationItems } from "../src/useRuntimeNavigationItems.ts";

function renderUseNavigationItemsHook(runtime: ReactRouterRuntime, menuId?: string) {
    return renderHook(() => useRuntimeNavigationItems({ menuId }), {
        wrapper: ({ children }: { children?: ReactNode }) => (
            <RuntimeContext.Provider value={runtime}>
                {children}
            </RuntimeContext.Provider>
        )
    });
}

test("when no menu id is specified, returns all the registered navigation items for the root menu", () => {
    const runtime = new ReactRouterRuntime();

    runtime.registerNavigationItem({
        $label: "Item 1",
        to: "/item-1"
    });

    runtime.registerNavigationItem({
        $label: "Item 2",
        to: "/item-2"
    });

    runtime.registerNavigationItem({
        $label: "Item 3",
        to: "/item-3"
    });

    runtime.registerNavigationItem({
        $label: "Item 4",
        to: "/item-4"
    }, {
        menuId: "menu-1"
    });

    runtime.registerNavigationItem({
        $label: "Item 5",
        to: "/item-5"
    }, {
        menuId: "menu-2"
    });

    const { result } = renderUseNavigationItemsHook(runtime);

    expect(result.current.length).toBe(3);
});

test("when a menu id is specified, returns all the registered navigation items for that specific menu", () => {
    const runtime = new ReactRouterRuntime();

    runtime.registerNavigationItem({
        $label: "Item 1",
        to: "/item-1"
    });

    runtime.registerNavigationItem({
        $label: "Item 2",
        to: "/item-2"
    });

    runtime.registerNavigationItem({
        $label: "Item 3",
        to: "/item-3"
    });

    runtime.registerNavigationItem({
        $label: "Item 4",
        to: "/item-4"
    }, {
        menuId: "menu-1"
    });

    runtime.registerNavigationItem({
        $label: "Item 5",
        to: "/item-5"
    }, {
        menuId: "menu-2"
    });

    const { result } = renderUseNavigationItemsHook(runtime, "menu-1");

    expect(result.current.length).toBe(1);
});

test("returned array is immutable", () => {
    const runtime = new ReactRouterRuntime();

    runtime.registerNavigationItem({
        $label: "Foo",
        to: "/foo"
    });

    const { result, rerender } = renderUseNavigationItemsHook(runtime);

    const array1 = result.current;

    // Haven't updated the navigation items, the returned array should be "array1".
    rerender();

    const array2 = result.current;

    runtime.registerNavigationItem({
        $label: "Bar",
        to: "/bar"
    });

    // Added a new navigation item, the returned array should be a new instance.
    rerender();

    const array3 = result.current;

    expect(array1).toEqual(array2);
    expect(array1).not.toEqual(array3);
});
