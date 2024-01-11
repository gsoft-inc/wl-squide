// Not all permutations are tested because there are simply too many. The code path that we deem the most important to test
// has been handled and additional tests will be added once bugs are discovered.

import { RuntimeContext, __resetLocalModuleRegistrations, registerLocalModules } from "@squide/core";
import { __resetMswStatus, setMswAsStarted } from "@squide/msw";
import { ReactRouterRuntime } from "@squide/react-router";
import { completeModuleRegistrations } from "@squide/webpack-module-federation";
import { render, screen } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { AppRouter, type AppRouterProps } from "../src/AppRouter.tsx";

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

function createAppRouter(props: Omit<AppRouterProps, "fallbackElement" | "errorElement" | "children">) {
    return (
        <AppRouter
            fallbackElement={<Loading />}
            errorElement={<ErrorBoundary />}
            {...props}
        >
            {(routes, providerProps) => (
                <RouterProvider router={createBrowserRouter(routes)} {...providerProps} />
            )}
        </AppRouter>
    );
}

function renderWithRuntime(runtime: ReactRouterRuntime, ui: ReactElement) {
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
    const runtime = new ReactRouterRuntime();

    // Must add at least a route otherwise useRouteMatchProtected will throw.
    runtime.registerRoute({
        path: "*",
        element: <div>A wildcard route</div>
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
    const runtime = new ReactRouterRuntime();

    // Must add at least a route otherwise useRouteMatchProtected will throw.
    runtime.registerRoute({
        path: "*",
        element: <div>A wildcard route</div>
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
    const runtime = new ReactRouterRuntime();

    // Must add at least a route otherwise useRouteMatchProtected will throw.
    runtime.registerRoute({
        path: "*",
        element: <div>A wildcard route</div>
    }, {
        hoist: true
    });

    await registerLocalModules([() => () => Promise.resolve()], runtime);

    renderWithRuntime(runtime, createAppRouter({
        waitForMsw: false
    }));

    expect(await screen.findByTestId("loading")).toBeInTheDocument();
});

test("when a onLoadPublicData handler is provided and the public data is not loaded, render the fallback", async () => {
    const runtime = new ReactRouterRuntime();

    // Must add at least a route otherwise useRouteMatchProtected will throw.
    runtime.registerRoute({
        $visibility: "public",
        path: "*",
        element: <div>A wildcard route</div>
    }, {
        hoist: true
    });

    await registerLocalModules([() => {}], runtime);

    renderWithRuntime(runtime, createAppRouter({
        // Never resolving Promise object.
        onLoadPublicData: () => new Promise(() => {}),
        waitForMsw: false
    }));

    expect(await screen.findByTestId("loading")).toBeInTheDocument();
});

test("when a onLoadPublicData handler is provided and the public data is loaded, render the router", async () => {
    const runtime = new ReactRouterRuntime();

    runtime.registerRoute({
        $visibility: "public",
        index: true,
        element: <div data-testid="route">A route</div>
    }, {
        hoist: true
    });

    await registerLocalModules([() => {}], runtime);

    renderWithRuntime(runtime, createAppRouter({
        onLoadPublicData: () => Promise.resolve(),
        waitForMsw: false
    }));

    expect(await screen.findByTestId("route")).toBeInTheDocument();
});

test("when a onLoadProtectedData handler is provided and the protected data is not loaded, render the fallback", async () => {
    const runtime = new ReactRouterRuntime();

    // Must add at least a route otherwise React Router complains the router has no routes.
    runtime.registerRoute({
        path: "*",
        element: <div>A wildcard route</div>
    }, {
        hoist: true
    });

    await registerLocalModules([() => {}], runtime);

    renderWithRuntime(runtime, createAppRouter({
        // Never resolving Promise object.
        onLoadProtectedData: () => new Promise(() => {}),
        waitForMsw: false
    }));

    expect(await screen.findByTestId("loading")).toBeInTheDocument();
});

test("when a onLoadProtectedData handler is provided and the protected data is loaded, render the router", async () => {
    const runtime = new ReactRouterRuntime();

    runtime.registerRoute({
        index: true,
        element: <div data-testid="route">A route</div>
    }, {
        hoist: true
    });

    await registerLocalModules([() => {}], runtime);

    renderWithRuntime(runtime, createAppRouter({
        onLoadProtectedData: () => Promise.resolve(),
        waitForMsw: false
    }));

    expect(await screen.findByTestId("route")).toBeInTheDocument();
});

test("when msw is enabled and msw is not started, render the fallback", async () => {
    const runtime = new ReactRouterRuntime();

    // Must add at least a route otherwise React Router complains the router has no routes.
    runtime.registerRoute({
        path: "*",
        element: <div>A wildcard route</div>
    }, {
        hoist: true
    });

    await registerLocalModules([() => {}], runtime);

    renderWithRuntime(runtime, createAppRouter({
        waitForMsw: true
    }));

    expect(await screen.findByTestId("loading")).toBeInTheDocument();
});

test("when msw is enabled and msw is started, render the router", async () => {
    const runtime = new ReactRouterRuntime();

    runtime.registerRoute({
        index: true,
        element: <div data-testid="route">A route</div>
    }, {
        hoist: true
    });

    await registerLocalModules([() => {}], runtime);

    setMswAsStarted();

    renderWithRuntime(runtime, createAppRouter({
        waitForMsw: true
    }));

    expect(await screen.findByTestId("route")).toBeInTheDocument();
});

test("when a onCompleteRegistrations handler is provided and there's no deferred registrations, render the router", async () => {
    const runtime = new ReactRouterRuntime();

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

test("when a onCompleteRegistrations handler is provided and the deferred registrations are not completed, render the fallback", async () => {
    const runtime = new ReactRouterRuntime();

    // Must add at least a route otherwise React Router complains the router has no routes.
    runtime.registerRoute({
        path: "*",
        element: <div>A wildcard route</div>
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
    const runtime = new ReactRouterRuntime();

    // Must add at least a route otherwise React Router complains the router has no routes.
    runtime.registerRoute({
        path: "*",
        element: <div>A wildcard route</div>
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

test("when an error occurs while loading the public data, show the error element", async () => {
    // An error log is expected because it will hit the ErrorBoundary, see: https://github.com/facebook/react/issues/11098.
    const spy = jest.spyOn(console, "error");
    spy.mockImplementation(() => {});

    const runtime = new ReactRouterRuntime();

    // Must add at least a route otherwise useRouteMatchProtected will throw.
    runtime.registerRoute({
        $visibility: "public",
        path: "*",
        element: <div>A wildcard route</div>
    }, {
        hoist: true
    });

    await registerLocalModules([() => {}], runtime);

    renderWithRuntime(runtime, createAppRouter({
        onLoadPublicData: () => Promise.reject("Dummy error"),
        waitForMsw: false
    }));

    expect(await screen.findByTestId("error")).toBeInTheDocument();

    spy.mockRestore();
});

test("when an error occurs while loading the protected data, show the error element", async () => {
    // An error log is expected because it will hit the ErrorBoundary, see: https://github.com/facebook/react/issues/11098.
    const spy = jest.spyOn(console, "error");
    spy.mockImplementation(() => {});

    const runtime = new ReactRouterRuntime();

    // Must add at least a route otherwise useRouteMatchProtected will throw.
    runtime.registerRoute({
        path: "*",
        element: <div>A wildcard route</div>
    }, {
        hoist: true
    });

    await registerLocalModules([() => {}], runtime);

    renderWithRuntime(runtime, createAppRouter({
        onLoadProtectedData: () => Promise.reject("Dummy error"),
        waitForMsw: false
    }));

    expect(await screen.findByTestId("error")).toBeInTheDocument();

    spy.mockRestore();
});
