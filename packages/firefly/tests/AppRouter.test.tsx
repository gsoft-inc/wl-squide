// Not all permutations are tested because there are simply too many. The code path that we deem the most important to test
// has been handled and additional tests will be added once bugs are discovered.

import { RuntimeContext, __resetLocalModuleRegistrations, registerLocalModules } from "@squide/core";
import { completeModuleRegistrations } from "@squide/module-federation";
import { __resetMswStatus, setMswAsReady } from "@squide/msw";
import { render, screen } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { LegacyAppRouter, type LegacyAppRouterProps } from "../src/LegacyAppRouter.tsx";
import { FireflyRuntime } from "../src/fireflyRuntime2.tsx";

function Loading() {
    return (
        <div data-testid="loading">Loading...</div>
    );
}

function ErrorBoundary() {
    return (
        <div data-testid="error">An error occured!</div>
    );
}

function createAppRouter(props: Omit<LegacyAppRouterProps, "fallbackElement" | "errorElement" | "children">) {
    return (
        <LegacyAppRouter
            fallbackElement={<Loading />}
            errorElement={<ErrorBoundary />}
            {...props}
        >
            {(routes, providerProps) => (
                <RouterProvider router={createBrowserRouter(routes)} {...providerProps} />
            )}
        </LegacyAppRouter>
    );
}

function renderWithRuntime(runtime: FireflyRuntime, ui: ReactElement) {
    return render(ui, {
        wrapper: ({ children }: { children?: ReactNode }) => {
            return (
                <RuntimeContext.Provider value={runtime}>
                    {children}
                </RuntimeContext.Provider>
            );
        }
    });
}

beforeEach(() => {
    __resetLocalModuleRegistrations();
    __resetMswStatus();
});

test("when no data handlers are provided, msw is disabled, there's no deferred registrations, and modules are not registered yet, render the fallback", async () => {
    const runtime = new FireflyRuntime();

    runtime.registerRoute({
        path: "*",
        element: <div>A custom no match route</div>
    }, {
        hoist: true
    });

    // Never resolving Promise object.
    registerLocalModules([() => new Promise<void>(() => {})], runtime);

    renderWithRuntime(runtime, createAppRouter({
        waitForMsw: false
    }));

    expect(await screen.findByTestId("loading")).toBeInTheDocument();
});

test("when no data handlers are provided, msw is disabled, there's no deferred registrations, and modules are registered, render the router", async () => {
    const runtime = new FireflyRuntime();

    runtime.registerRoute({
        path: "*",
        element: <div>A custom no match route</div>
    }, {
        hoist: true
    });

    await registerLocalModules([() => {
        runtime.registerRoute({
            index: true,
            element: <div data-testid="module-route">A route</div>
        }, {
            hoist: true
        });
    }], runtime);

    renderWithRuntime(runtime, createAppRouter({
        waitForMsw: false
    }));

    expect(await screen.findByTestId("module-route")).toBeInTheDocument();
});

test("when no data handlers are provided, msw is disabled, modules are registered but there's uncompleted deferred registrations, render the fallback", async () => {
    const runtime = new FireflyRuntime();

    runtime.registerRoute({
        path: "*",
        element: <div>A custom no match route</div>
    }, {
        hoist: true
    });

    await registerLocalModules([() => () => Promise.resolve()], runtime);

    renderWithRuntime(runtime, createAppRouter({
        waitForMsw: false
    }));

    expect(await screen.findByTestId("loading")).toBeInTheDocument();
});

test("when a onLoadPublicData handler is provided and the public data is not loaded, render the fallback element", async () => {
    const runtime = new FireflyRuntime();

    runtime.registerRoute({
        path: "*",
        element: <div>A custom no match route</div>
    }, {
        hoist: true
    });

    await registerLocalModules([() => {}], runtime);

    renderWithRuntime(runtime, createAppRouter({
        // Never resolving Promise object.
        onLoadPublicData: () => new Promise(() => {}),
        isPublicDataLoaded: false,
        waitForMsw: false
    }));

    expect(await screen.findByTestId("loading")).toBeInTheDocument();
});

test("when a onLoadPublicData handler is provided and the public data is loaded, render the router", async () => {
    const runtime = new FireflyRuntime();

    runtime.registerRoute({
        path: "*",
        element: <div>A custom no match route</div>
    }, {
        hoist: true
    });

    runtime.registerRoute({
        $visibility: "public",
        index: true,
        element: <div data-testid="route">A route</div>
    }, {
        hoist: true
    });

    await registerLocalModules([() => {}], runtime);

    const handleLoadPublicData = () => Promise.resolve();

    const { rerender } = renderWithRuntime(runtime, createAppRouter({
        onLoadPublicData: handleLoadPublicData,
        isPublicDataLoaded: false,
        waitForMsw: false
    }));

    rerender(createAppRouter({
        onLoadPublicData: handleLoadPublicData,
        isPublicDataLoaded: true,
        waitForMsw: false
    }));

    expect(await screen.findByTestId("route")).toBeInTheDocument();
});

test("when a onLoadProtectedData handler is provided and the protected data is not loaded, render the fallback element", async () => {
    const runtime = new FireflyRuntime();

    runtime.registerRoute({
        path: "*",
        element: <div>A custom no match route</div>
    }, {
        hoist: true
    });

    await registerLocalModules([() => {}], runtime);

    renderWithRuntime(runtime, createAppRouter({
        // Never resolving Promise object.
        onLoadProtectedData: () => new Promise(() => {}),
        isProtectedDataLoaded: false,
        waitForMsw: false
    }));

    expect(await screen.findByTestId("loading")).toBeInTheDocument();
});

test("when a onLoadProtectedData handler is provided and the protected data is loaded, render the router", async () => {
    const runtime = new FireflyRuntime();

    runtime.registerRoute({
        path: "*",
        element: <div>A custom no match route</div>
    }, {
        hoist: true
    });

    runtime.registerRoute({
        index: true,
        element: <div data-testid="route">A route</div>
    }, {
        hoist: true
    });

    await registerLocalModules([() => {}], runtime);

    const handleLoadProtectedData = () => Promise.resolve();

    const { rerender } = renderWithRuntime(runtime, createAppRouter({
        onLoadProtectedData: handleLoadProtectedData,
        isProtectedDataLoaded: false,
        waitForMsw: false
    }));

    rerender(createAppRouter({
        onLoadProtectedData: handleLoadProtectedData,
        isProtectedDataLoaded: true,
        waitForMsw: false
    }));

    expect(await screen.findByTestId("route")).toBeInTheDocument();
});

test("when msw is enabled and msw is not ready, render the fallback element", async () => {
    const runtime = new FireflyRuntime();

    runtime.registerRoute({
        path: "*",
        element: <div>A custom no match route</div>
    }, {
        hoist: true
    });

    await registerLocalModules([() => {}], runtime);

    renderWithRuntime(runtime, createAppRouter({
        waitForMsw: true
    }));

    expect(await screen.findByTestId("loading")).toBeInTheDocument();
});

test("when msw is enabled and msw is ready, render the router", async () => {
    const runtime = new FireflyRuntime();

    runtime.registerRoute({
        path: "*",
        element: <div>A custom no match route</div>
    }, {
        hoist: true
    });

    runtime.registerRoute({
        index: true,
        element: <div data-testid="route">A route</div>
    }, {
        hoist: true
    });

    await registerLocalModules([() => {}], runtime);

    setMswAsReady();

    renderWithRuntime(runtime, createAppRouter({
        waitForMsw: true
    }));

    expect(await screen.findByTestId("route")).toBeInTheDocument();
});

test("when a onCompleteRegistrations handler is provided and there's no deferred registrations, render the router", async () => {
    const runtime = new FireflyRuntime();

    runtime.registerRoute({
        path: "*",
        element: <div>A custom no match route</div>
    }, {
        hoist: true
    });

    runtime.registerRoute({
        index: true,
        element: <div data-testid="route">A route</div>
    }, {
        hoist: true
    });

    await registerLocalModules([() => {}], runtime);

    renderWithRuntime(runtime, createAppRouter({
        onCompleteRegistrations: () => Promise.resolve(),
        waitForMsw: false
    }));

    expect(await screen.findByTestId("route")).toBeInTheDocument();
});

test("when a onCompleteRegistrations handler is provided and the deferred registrations are not completed, render the fallback element", async () => {
    const runtime = new FireflyRuntime();

    runtime.registerRoute({
        path: "*",
        element: <div>A custom no match route</div>
    }, {
        hoist: true
    });

    // Never resolving Promise object.
    await registerLocalModules([() => () => new Promise(() => {})], runtime);

    renderWithRuntime(runtime, createAppRouter({
        onCompleteRegistrations: () => completeModuleRegistrations(runtime, {}),
        waitForMsw: false
    }));

    expect(await screen.findByTestId("loading")).toBeInTheDocument();
});

test("when a onCompleteRegistrations handler is provided and the deferred registrations are completed, render the router", async () => {
    const runtime = new FireflyRuntime();

    runtime.registerRoute({
        path: "*",
        element: <div>A custom no match route</div>
    }, {
        hoist: true
    });

    await registerLocalModules([() => {
        return () => {
            runtime.registerRoute({
                index: true,
                element: <div data-testid="deferred-route">A deferred route</div>
            }, {
                hoist: true
            });
        };
    }], runtime);

    function handleCompleteRegistration() {
        return completeModuleRegistrations(runtime, {});
    }

    const { rerender } = renderWithRuntime(runtime, createAppRouter({
        onCompleteRegistrations: handleCompleteRegistration,
        waitForMsw: false
    }));

    rerender(createAppRouter({
        onCompleteRegistrations: handleCompleteRegistration,
        waitForMsw: false
    }));

    expect(await screen.findByTestId("deferred-route")).toBeInTheDocument();
});

test("when a onCompleteRegistrations handler is provided and a onLoadPublicData handler is provided, do not complete the deferred registrations and render the route until the public date is loaded", async () => {
    const runtime = new FireflyRuntime();

    runtime.registerRoute({
        path: "*",
        element: <div>A custom no match route</div>
    }, {
        hoist: true
    });

    await registerLocalModules([() => {
        return () => {
            runtime.registerRoute({
                index: true,
                element: <div data-testid="deferred-route">A deferred route</div>
            }, {
                hoist: true
            });
        };
    }], runtime);

    const handleLoadPublicData = () => Promise.resolve();

    const handleCompleteRegistrations = jest.fn(() => {
        return completeModuleRegistrations(runtime, {});
    });

    const { rerender } = renderWithRuntime(runtime, createAppRouter({
        onLoadPublicData: handleLoadPublicData,
        isPublicDataLoaded: false,
        onCompleteRegistrations: handleCompleteRegistrations,
        waitForMsw: false
    }));

    expect(handleCompleteRegistrations).not.toHaveBeenCalled();
    expect(await screen.findByTestId("loading")).toBeInTheDocument();

    rerender(createAppRouter({
        onLoadPublicData: handleLoadPublicData,
        isPublicDataLoaded: false,
        onCompleteRegistrations: handleCompleteRegistrations,
        waitForMsw: false
    }));

    expect(handleCompleteRegistrations).not.toHaveBeenCalled();
    expect(await screen.findByTestId("loading")).toBeInTheDocument();

    rerender(createAppRouter({
        onLoadPublicData: handleLoadPublicData,
        isPublicDataLoaded: true,
        onCompleteRegistrations: handleCompleteRegistrations,
        waitForMsw: false
    }));

    expect(handleCompleteRegistrations).toHaveBeenCalled();
    expect(await screen.findByTestId("deferred-route")).toBeInTheDocument();
});

test("when a onCompleteRegistrations handler is provided and a onLoadProtectedData handler is provided, do not complete the deferred registrations and render the route until the protected date is loaded", async () => {
    const runtime = new FireflyRuntime();

    runtime.registerRoute({
        path: "*",
        element: <div>A custom no match route</div>
    }, {
        hoist: true
    });

    await registerLocalModules([() => {
        return () => {
            runtime.registerRoute({
                index: true,
                element: <div data-testid="deferred-route">A deferred route</div>
            }, {
                hoist: true
            });
        };
    }], runtime);

    const handleLoadProtectedData = () => Promise.resolve();

    const handleCompleteRegistrations = jest.fn(() => {
        return completeModuleRegistrations(runtime, {});
    });

    const { rerender } = renderWithRuntime(runtime, createAppRouter({
        onLoadProtectedData: handleLoadProtectedData,
        isProtectedDataLoaded: false,
        onCompleteRegistrations: handleCompleteRegistrations,
        waitForMsw: false
    }));

    expect(handleCompleteRegistrations).not.toHaveBeenCalled();
    expect(await screen.findByTestId("loading")).toBeInTheDocument();

    rerender(createAppRouter({
        onLoadProtectedData: handleLoadProtectedData,
        isProtectedDataLoaded: false,
        onCompleteRegistrations: handleCompleteRegistrations,
        waitForMsw: false
    }));

    expect(handleCompleteRegistrations).not.toHaveBeenCalled();
    expect(await screen.findByTestId("loading")).toBeInTheDocument();

    rerender(createAppRouter({
        onLoadProtectedData: handleLoadProtectedData,
        isProtectedDataLoaded: true,
        onCompleteRegistrations: handleCompleteRegistrations,
        waitForMsw: false
    }));

    expect(handleCompleteRegistrations).toHaveBeenCalled();
    expect(await screen.findByTestId("deferred-route")).toBeInTheDocument();
});

test("when a onCompleteRegistrations handler is provided, a onLoadPublicData handler and a onLoadProtectedData handler are provided, do not complete the deferred registrations and render the route until the public and protected date are loaded", async () => {
    const runtime = new FireflyRuntime();

    runtime.registerRoute({
        path: "*",
        element: <div>A custom no match route</div>
    }, {
        hoist: true
    });

    await registerLocalModules([() => {
        return () => {
            runtime.registerRoute({
                index: true,
                element: <div data-testid="deferred-route">A deferred route</div>
            }, {
                hoist: true
            });
        };
    }], runtime);

    const handleLoadPublicData = () => Promise.resolve();
    const handleLoadProtectedData = () => Promise.resolve();

    const handleCompleteRegistrations = jest.fn(() => {
        return completeModuleRegistrations(runtime, {});
    });

    const { rerender } = renderWithRuntime(runtime, createAppRouter({
        onLoadPublicData: handleLoadPublicData,
        onLoadProtectedData: handleLoadProtectedData,
        isPublicDataLoaded: false,
        isProtectedDataLoaded: false,
        onCompleteRegistrations: handleCompleteRegistrations,
        waitForMsw: false
    }));

    expect(handleCompleteRegistrations).not.toHaveBeenCalled();
    expect(await screen.findByTestId("loading")).toBeInTheDocument();

    rerender(createAppRouter({
        onLoadPublicData: handleLoadPublicData,
        onLoadProtectedData: handleLoadProtectedData,
        isPublicDataLoaded: true,
        isProtectedDataLoaded: false,
        onCompleteRegistrations: handleCompleteRegistrations,
        waitForMsw: false
    }));

    expect(handleCompleteRegistrations).not.toHaveBeenCalled();
    expect(await screen.findByTestId("loading")).toBeInTheDocument();

    rerender(createAppRouter({
        onLoadPublicData: handleLoadPublicData,
        onLoadProtectedData: handleLoadProtectedData,
        isPublicDataLoaded: true,
        isProtectedDataLoaded: true,
        onCompleteRegistrations: handleCompleteRegistrations,
        waitForMsw: false
    }));

    expect(handleCompleteRegistrations).toHaveBeenCalled();
    expect(await screen.findByTestId("deferred-route")).toBeInTheDocument();
});

test("when an error occurs while loading the public data, render the error element", async () => {
    // An error log is expected because it will hit the ErrorBoundary, see: https://github.com/facebook/react/issues/11098.
    const spy = jest.spyOn(console, "error");
    spy.mockImplementation(() => {});

    const runtime = new FireflyRuntime();

    runtime.registerRoute({
        path: "*",
        element: <div>A custom no match route</div>
    }, {
        hoist: true
    });

    await registerLocalModules([() => {}], runtime);

    renderWithRuntime(runtime, createAppRouter({
        onLoadPublicData: () => Promise.reject("Dummy error"),
        isPublicDataLoaded: false,
        waitForMsw: false
    }));

    expect(await screen.findByTestId("error")).toBeInTheDocument();

    spy.mockRestore();
});

test("when an error occurs while loading the protected data, render the error element", async () => {
    // An error log is expected because it will hit the ErrorBoundary, see: https://github.com/facebook/react/issues/11098.
    const spy = jest.spyOn(console, "error");
    spy.mockImplementation(() => {});

    const runtime = new FireflyRuntime();

    runtime.registerRoute({
        path: "*",
        element: <div>A custom no match route</div>
    }, {
        hoist: true
    });

    await registerLocalModules([() => {}], runtime);

    renderWithRuntime(runtime, createAppRouter({
        onLoadProtectedData: () => Promise.reject("Dummy error"),
        isProtectedDataLoaded: false,
        waitForMsw: false
    }));

    expect(await screen.findByTestId("error")).toBeInTheDocument();

    spy.mockRestore();
});

test("throw an error if no custom no match route are registered", async () => {
    const runtime = new FireflyRuntime();

    await registerLocalModules([() => {}], runtime);

    expect(() => renderWithRuntime(runtime, createAppRouter({
        waitForMsw: false
    }))).toThrow(/For the AppRouter component to work properly, the application must define a custom no match route/);
});
