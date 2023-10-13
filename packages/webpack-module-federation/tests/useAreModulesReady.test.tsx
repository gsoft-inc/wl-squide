import { AbstractRuntime, RuntimeContext, registerLocalModules, resetLocalModulesRegistrationStatus } from "@squide/core";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { loadRemote } from "../src/loadRemote.ts";
import { registerRemoteModules, resetRemoteModuleRegistrationStatus } from "../src/registerRemoteModules.ts";
import { useAreModulesReady } from "../src/useAreModulesReady.ts";

// The mock implementation is defined directly in the tests.
jest.mock("../src/loadRemote.ts");

// The interval at which the hook will perform a check to determine if the modules are ready.
const CheckInterval = 10;

class DummyRuntime extends AbstractRuntime<unknown, unknown> {
    registerRoute() {
        throw new Error("Method not implemented.");
    }

    get routes() {
        return [];
    }

    registerNavigationItem() {
        throw new Error("Method not implemented.");
    }

    getNavigationItems() {
        return [];
    }
}

function renderWithRuntime(runtime: AbstractRuntime) {
    return renderHook(() => useAreModulesReady({ interval: CheckInterval }), {
        wrapper: ({ children }: { children?: ReactNode }) => (
            <RuntimeContext.Provider value={runtime}>
                {children}
            </RuntimeContext.Provider>
        )
    });
}

beforeEach(() => {
    // Since the module registration status variables are singletons,
    // they are not reseted between the tests.
    resetLocalModulesRegistrationStatus();
    resetRemoteModuleRegistrationStatus();

    // Typing a mocked imported function is too complicated.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (loadRemote.mockClear) {
        // Typing a mocked imported function is too complicated.
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        loadRemote.mockClear();
    }

    jest.useFakeTimers();
});

afterEach(() => {
    jest.useRealTimers();
});

test("when only local modules are registered, return true when all the local modules are registered", () => {
    const runtime = new DummyRuntime();

    registerLocalModules([
        () => {},
        () => {},
        () => {}
    ], runtime);

    const { result } = renderWithRuntime(runtime);

    expect(result.current).toBeFalsy();

    // To justify the usage of act, refer to: https://github.com/testing-library/react-hooks-testing-library/issues/241
    act(() => {
        jest.advanceTimersByTime(CheckInterval + 1);
    });

    expect(result.current).toBeTruthy();
});

test("when only remote modules are registered, return true when all the remote modules are registered", async () => {
    // Typing a mocked imported function is too complicated.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    loadRemote.mockResolvedValue({
        register: jest.fn()
    });

    const runtime = new DummyRuntime();

    await registerRemoteModules([
        { name: "Dummy-1", url: "http://anything1.com" },
        { name: "Dummy-2", url: "http://anything2.com" },
        { name: "Dummy-3", url: "http://anything3.com" }
    ], runtime);

    const { result } = renderWithRuntime(runtime);

    expect(result.current).toBeFalsy();

    // To justify the usage of act, refer to: https://github.com/testing-library/react-hooks-testing-library/issues/241
    act(() => {
        jest.advanceTimersByTime(CheckInterval + 1);
    });

    expect(result.current).toBeTruthy();
});

test("when local and remote modules are registered, return true when all the remote modules are registered", async () => {
    // Typing a mocked imported function is too complicated.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    loadRemote.mockResolvedValue({
        register: jest.fn()
    });

    const runtime = new DummyRuntime();

    registerLocalModules([
        () => {},
        () => {},
        () => {}
    ], runtime);

    await registerRemoteModules([
        { name: "Dummy-1", url: "http://anything1.com" },
        { name: "Dummy-2", url: "http://anything2.com" },
        { name: "Dummy-3", url: "http://anything3.com" }
    ], runtime);

    const { result } = renderWithRuntime(runtime);

    expect(result.current).toBeFalsy();

    // To justify the usage of act, refer to: https://github.com/testing-library/react-hooks-testing-library/issues/241
    act(() => {
        jest.advanceTimersByTime(CheckInterval + 1);
    });

    expect(result.current).toBeTruthy();
});

test("when a local module registration fail, return true when all the other modules are registered", () => {
    const runtime = new DummyRuntime();

    registerLocalModules([
        () => {},
        () => { throw new Error("Registration failed!"); },
        () => {}
    ], runtime);

    const { result } = renderWithRuntime(runtime);

    expect(result.current).toBeFalsy();

    // To justify the usage of act, refer to: https://github.com/testing-library/react-hooks-testing-library/issues/241
    act(() => {
        jest.advanceTimersByTime(CheckInterval + 1);
    });

    expect(result.current).toBeTruthy();
});

test("when a remote module registration fail, return true when all the other modules are registered", async () => {
    const resolvedValue = {
        register: jest.fn()
    };

    // Typing a mocked imported function is too complicated.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    loadRemote.mockResolvedValueOnce(resolvedValue).mockResolvedValueOnce(resolvedValue).mockRejectedValueOnce(null);

    const runtime = new DummyRuntime();

    await registerRemoteModules([
        { name: "Dummy-1", url: "http://anything1.com" },
        { name: "Dummy-2", url: "http://anything2.com" },
        { name: "Dummy-3", url: "http://anything3.com" }
    ], runtime);

    const { result } = renderWithRuntime(runtime);

    expect(result.current).toBeFalsy();

    // To justify the usage of act, refer to: https://github.com/testing-library/react-hooks-testing-library/issues/241
    act(() => {
        jest.advanceTimersByTime(CheckInterval + 1);
    });

    expect(result.current).toBeTruthy();
});
