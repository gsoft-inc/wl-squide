import { RuntimeContext, __resetLocalModuleRegistrations, registerLocalModules } from "@squide/core";
import { __resetMswStatus, setMswAsStarted } from "@squide/msw";
import { ReactRouterRuntime } from "@squide/react-router";
import { completeModuleRegistrations } from "@squide/webpack-module-federation";
import { render, screen } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { AppRouter } from "../src/AppRouter.tsx";

// Not all permutations are testedbecause there are simply too many. The code path that we deem the most important to test
// has been handled and additional tests will be added once bugs are discovered.

function Loading() {
    return (
        <div role="loading">Loading...</div>
    );
}

function ErrorBoundary() {
    return (
        <div role="error">An error occured!</div>
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

    renderWithRuntime(runtime, <AppRouter
        fallbackElement={<Loading />}
        errorElement={<ErrorBoundary />}
        waitForMsw={false}
    />);

    expect(await screen.findByRole("loading")).toBeInTheDocument();
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
            element: <div role="module-route">A route</div>
        }, {
            hoist: true
        });
    }], runtime);

    renderWithRuntime(runtime, <AppRouter
        fallbackElement={<Loading />}
        errorElement={<ErrorBoundary />}
        waitForMsw={false}
    />);

    expect(await screen.findByRole("module-route")).toBeInTheDocument();
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

    renderWithRuntime(runtime, <AppRouter
        fallbackElement={<Loading />}
        errorElement={<ErrorBoundary />}
        waitForMsw={false}
    />);

    expect(await screen.findByRole("loading")).toBeInTheDocument();
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

    renderWithRuntime(runtime, <AppRouter
        fallbackElement={<Loading />}
        errorElement={<ErrorBoundary />}
        // Never resolving Promise object.
        onLoadPublicData={() => new Promise(() => {})}
        waitForMsw={false}
    />);

    expect(await screen.findByRole("loading")).toBeInTheDocument();
});

test("when a onLoadPublicData handler is provided and the public data is loaded, render the router", async () => {
    const runtime = new ReactRouterRuntime();

    runtime.registerRoute({
        $visibility: "public",
        index: true,
        element: <div role="route">A route</div>
    }, {
        hoist: true
    });

    await registerLocalModules([() => {}], runtime);

    renderWithRuntime(runtime, <AppRouter
        fallbackElement={<Loading />}
        errorElement={<ErrorBoundary />}
        onLoadPublicData={() => Promise.resolve()}
        waitForMsw={false}
    />);

    expect(await screen.findByRole("route")).toBeInTheDocument();
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

    renderWithRuntime(runtime, <AppRouter
        fallbackElement={<Loading />}
        errorElement={<ErrorBoundary />}
        // Never resolving Promise object.
        onLoadProtectedData={() => new Promise(() => {})}
        waitForMsw={false}
    />);

    expect(await screen.findByRole("loading")).toBeInTheDocument();
});

test("when a onLoadProtectedData handler is provided and the protected data is loaded, render the router", async () => {
    const runtime = new ReactRouterRuntime();

    runtime.registerRoute({
        index: true,
        element: <div role="route">A route</div>
    }, {
        hoist: true
    });

    await registerLocalModules([() => {}], runtime);

    renderWithRuntime(runtime, <AppRouter
        fallbackElement={<Loading />}
        errorElement={<ErrorBoundary />}
        onLoadProtectedData={() => Promise.resolve()}
        waitForMsw={false}
    />);

    expect(await screen.findByRole("route")).toBeInTheDocument();
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

    renderWithRuntime(runtime, <AppRouter
        fallbackElement={<Loading />}
        errorElement={<ErrorBoundary />}
        waitForMsw={true}
    />);

    expect(await screen.findByRole("loading")).toBeInTheDocument();
});

test("when msw is enabled and msw is started, render the router", async () => {
    const runtime = new ReactRouterRuntime();

    runtime.registerRoute({
        index: true,
        element: <div role="route">A route</div>
    }, {
        hoist: true
    });

    await registerLocalModules([() => {}], runtime);

    setMswAsStarted();

    renderWithRuntime(runtime, <AppRouter
        fallbackElement={<Loading />}
        errorElement={<ErrorBoundary />}
        waitForMsw={true}
    />);

    expect(await screen.findByRole("route")).toBeInTheDocument();
});

test("when a onCompleteRegistrations handler is provided and there's no deferred registrations, render the router", async () => {
    const runtime = new ReactRouterRuntime();

    runtime.registerRoute({
        index: true,
        element: <div role="route">A route</div>
    }, {
        hoist: true
    });

    await registerLocalModules([() => {}], runtime);

    renderWithRuntime(runtime, <AppRouter
        fallbackElement={<Loading />}
        errorElement={<ErrorBoundary />}
        onCompleteRegistrations={() => Promise.resolve()}
        waitForMsw={false}
    />);

    expect(await screen.findByRole("route")).toBeInTheDocument();
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

    renderWithRuntime(runtime, <AppRouter
        fallbackElement={<Loading />}
        errorElement={<ErrorBoundary />}
        onCompleteRegistrations={() => completeModuleRegistrations(runtime, {})}
        waitForMsw={false}
    />);

    expect(await screen.findByRole("loading")).toBeInTheDocument();
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
                element: <div role="deferred-route">A deferred route</div>
            }, {
                hoist: true
            });
        };
    }], runtime);

    function handleCompleteRegistration() {
        return completeModuleRegistrations(runtime, {});
    }

    const { rerender } = renderWithRuntime(runtime, <AppRouter
        fallbackElement={<Loading />}
        errorElement={<ErrorBoundary />}
        onCompleteRegistrations={handleCompleteRegistration}
        waitForMsw={false}
    />);

    rerender(<AppRouter
        fallbackElement={<Loading />}
        errorElement={<ErrorBoundary />}
        onCompleteRegistrations={handleCompleteRegistration}
        waitForMsw={false}
    />);

    expect(await screen.findByRole("deferred-route")).toBeInTheDocument();
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

    renderWithRuntime(runtime, <AppRouter
        fallbackElement={<Loading />}
        errorElement={<ErrorBoundary />}
        onLoadPublicData={() => Promise.reject("Dummy error")}
        waitForMsw={false}
    />);

    expect(await screen.findByRole("error")).toBeInTheDocument();

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

    renderWithRuntime(runtime, <AppRouter
        fallbackElement={<Loading />}
        errorElement={<ErrorBoundary />}
        onLoadProtectedData={() => Promise.reject("Dummy error")}
        waitForMsw={false}
    />);

    expect(await screen.findByRole("error")).toBeInTheDocument();

    spy.mockRestore();
});
