import type { ReactNode } from "react";
import type { RenderHookOptions } from "@testing-library/react";
import type { RootRoute } from "../src/routeRegistry.ts";
import { Runtime } from "../src/runtime.ts";
import { RuntimeContext } from "@squide/core";
import { renderHook } from "@testing-library/react";
import { useRoutes } from "../src/useRoutes.ts";

function renderWithRuntime<TProps>(runtime: Runtime, additionalProps: RenderHookOptions<TProps> = {}) {
    return renderHook<RootRoute[], TProps>(() => useRoutes(), {
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

    runtime.registerRoutes([
        { path: "/foo", element: <div>Foo</div> },
        { path: "/bar", element: <div>Bar</div> }
    ]);

    const { result } = renderWithRuntime(runtime);

    expect(result.current.length).toBe(2);
});

test("returned array is immutable", () => {
    const runtime = new Runtime();

    runtime.registerRoutes([
        { path: "/foo", element: <div>Foo</div> }
    ]);

    const { result, rerender } = renderWithRuntime(runtime);

    const array1 = result.current;

    // Haven't added any routes, the returned array should be "array1".
    rerender();

    const array2 = result.current;

    expect(array1).toEqual(array2);

    runtime.registerRoutes([
        { path: "/bar", element: <div>Bar</div> }
    ]);

    // Added a new route, the returned array should be a new instance.
    rerender();

    const array3 = result.current;

    expect(array1).not.toEqual(array3);
});
