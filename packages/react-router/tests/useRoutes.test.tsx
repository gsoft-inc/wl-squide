import { RuntimeContext } from "@squide/core";
import { renderHook, type RenderHookOptions } from "@testing-library/react";
import { Runtime } from "../src/runtime.ts";
import { useRoutes } from "../src/useRoutes.ts";

function renderWithRuntime<TProps>(runtime: Runtime, additionalProps: RenderHookOptions<TProps> = {}) {
    return renderHook(() => useRoutes(), {
        wrapper: ({ children }) => (
            <RuntimeContext.Provider value={runtime}>
                {children}
            </RuntimeContext.Provider>
        ),
        ...additionalProps
    });
}

test("returns all the registered routes", () => {
    const runtime = new Runtime();

    runtime.registerRoute({
        path: "/foo",
        element: <div>Foo</div>
    }, {
        hoist: true
    });

    runtime.registerRoute({
        path: "/bar",
        element: <div>Bar</div>
    }, {
        hoist: true
    });

    const { result } = renderWithRuntime(runtime);

    expect(result.current.length).toBe(2);
});

test("returned array is immutable", () => {
    const runtime = new Runtime();

    runtime.registerRoute({
        path: "/foo",
        element: <div>Foo</div>
    }, {
        hoist: true
    });

    const { result, rerender } = renderWithRuntime(runtime);

    const array1 = result.current;

    // Haven't updated the routes, the returned array should be "array1".
    rerender();

    const array2 = result.current;

    runtime.registerRoute({
        path: "/bar",
        element: <div>Bar</div>
    }, {
        hoist: true
    });

    // Added a new route, the returned array should be a new instance.
    rerender();

    const array3 = result.current;

    expect(array1).toEqual(array2);
    expect(array1).not.toEqual(array3);
});
