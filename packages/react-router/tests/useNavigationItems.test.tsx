import { RuntimeContext } from "@squide/core";
import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { Runtime } from "../src/runtime.ts";
import { useNavigationItems } from "../src/useNavigationItems.ts";

function renderWithRuntime(runtime: Runtime, menuId?: string) {
    return renderHook(() => useNavigationItems(menuId), {
        wrapper: ({ children }: { children?: ReactNode }) => (
            <RuntimeContext.Provider value={runtime}>
                {children}
            </RuntimeContext.Provider>
        )
    });
}

test("when no menu id is specified, returns all the registered navigation items for the root menu", () => {
    const runtime = new Runtime();

    runtime.registerNavigationItem({
        to: "/item-1",
        label: "Item 1"
    });

    runtime.registerNavigationItem({
        to: "/item-2",
        label: "Item 2"
    });

    runtime.registerNavigationItem({
        to: "/item-3",
        label: "Item 3"
    });

    runtime.registerNavigationItem({
        to: "/item-4",
        label: "Item 4"
    }, {
        menuId: "menu-1"
    });

    runtime.registerNavigationItem({
        to: "/item-5",
        label: "Item 5"
    }, {
        menuId: "menu-2"
    });

    const { result } = renderWithRuntime(runtime);

    expect(result.current.length).toBe(3);
});

test("when a menu id is specified, returns all the registered navigation items for that specific menu", () => {
    const runtime = new Runtime();

    runtime.registerNavigationItem({
        to: "/item-1",
        label: "Item 1"
    });

    runtime.registerNavigationItem({
        to: "/item-2",
        label: "Item 2"
    });

    runtime.registerNavigationItem({
        to: "/item-3",
        label: "Item 3"
    });

    runtime.registerNavigationItem({
        to: "/item-4",
        label: "Item 4"
    }, {
        menuId: "menu-1"
    });

    runtime.registerNavigationItem({
        to: "/item-5",
        label: "Item 5"
    }, {
        menuId: "menu-2"
    });

    const { result } = renderWithRuntime(runtime, "menu-1");

    expect(result.current.length).toBe(1);
});

test("returned array is immutable", () => {
    const runtime = new Runtime();

    runtime.registerNavigationItem({
        to: "/foo",
        label: "Foo"
    });

    const { result, rerender } = renderWithRuntime(runtime);

    const array1 = result.current;

    // Haven't updated the navigation items, the returned array should be "array1".
    rerender();

    const array2 = result.current;

    runtime.registerNavigationItem({
        to: "/bar",
        label: "Bar"
    });

    // Added a new navigation item, the returned array should be a new instance.
    rerender();

    const array3 = result.current;

    expect(array1).toEqual(array2);
    expect(array1).not.toEqual(array3);
});
