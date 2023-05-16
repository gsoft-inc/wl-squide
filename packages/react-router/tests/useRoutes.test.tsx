import { ReactNode } from "react";
import { Runtime } from "../src/runtime.ts";
import { RuntimeContext } from "@squide/core";
import { renderHook } from "@testing-library/react";
import { useRoutes } from "../src/useRoutes.ts";

test("returns all the registered routes", () => {
    const runtime = new Runtime();

    runtime.registerRoutes([
        { path: "/foo", element: <div>Foo</div> },
        { path: "/bar", element: <div>Bar</div> }
    ]);

    const { result } = renderHook(() => useRoutes(), {
        wrapper: ({ children }: { children?: ReactNode }) => (
            <RuntimeContext.Provider value={runtime}>
                {children}
            </RuntimeContext.Provider>
        )
    });

    expect(result.current.length).toBe(2);
});

// test("returned routes array is immutable", () => {

// });
