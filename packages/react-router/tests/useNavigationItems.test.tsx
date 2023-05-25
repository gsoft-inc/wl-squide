import type { ReactNode } from "react";
import { Runtime } from "../src/runtime.ts";
import { RuntimeContext } from "@squide/core";
import { renderHook, type RenderHookOptions } from "@testing-library/react";
import { useNavigationItems } from "../src/useNavigationItems.ts";
import type { RootNavigationItem } from "../src/navigationItemRegistry.ts";

function renderWithRuntime<TProps>(runtime: Runtime, additionalProps: RenderHookOptions<TProps> = {}) {
    return renderHook<RootNavigationItem[], TProps>(() => useNavigationItems(), {
        wrapper: ({ children }: { children?: ReactNode }) => (
            <RuntimeContext.Provider value={runtime}>
                {children}
            </RuntimeContext.Provider>
        ),
        ...additionalProps
    });
}

test("returns all the registered routes", () => {
    const runtime = new Runtime();

    runtime.registerNavigationItems([
        { to: "/foo", label: "Foo" },
        { to: "/bar", label: "Bar" }
    ]);

    const { result } = renderWithRuntime(runtime);

    expect(result.current.length).toBe(2);
});

test("returned array is immutable", () => {
    const runtime = new Runtime();

    runtime.registerNavigationItems([
        { to: "/foo", label: "Foo" }
    ]);

    const { result, rerender } = renderWithRuntime(runtime);

    const array1 = result.current;

    // Haven't updated the navigation items, the returned array should be "array1".
    rerender();

    const array2 = result.current;

    runtime.registerNavigationItems([
        { to: "/bar", label: "Bar" }
    ]);

    // Added a new navigation item, the returned array should be a new instance.
    rerender();

    const array3 = result.current;

    expect(array1).toEqual(array2);
    expect(array1).not.toEqual(array3);
});
