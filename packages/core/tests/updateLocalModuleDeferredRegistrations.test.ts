import { LocalModuleRegistry } from "../src/federation/registerLocalModules.ts";
import { Runtime } from "../src/runtime/runtime.ts";

function simulateDelay(delay: number) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(undefined);
        }, delay);
    });
}

class DummyRuntime extends Runtime<unknown, unknown> {
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

    startDeferredRegistrationScope(): void {
        throw new Error("Method not implemented.");
    }

    completeDeferredRegistrationScope(): void {
        throw new Error("Method not implemented.");
    }
}

const runtime = new DummyRuntime();

test("when called before registerLocalModules, throw an error", async () => {
    const registry = new LocalModuleRegistry();

    await expect(() => registry.updateDeferredRegistrations(runtime, {})).rejects.toThrow(/The updateDeferredRegistrations function can only be called once the local modules are ready/);
});

test("when called before registerLocalModuleDeferredRegistrations, throw an error", async () => {
    const registry = new LocalModuleRegistry();

    await registry.registerModules([
        () => () => {},
        () => () => {},
        () => () => {}
    ], runtime);

    await expect(() => registry.updateDeferredRegistrations(runtime, {})).rejects.toThrow(/The updateDeferredRegistrations function can only be called once the local modules are ready/);
});

test("can update all the deferred registrations", async () => {
    const registry = new LocalModuleRegistry();

    const register1 = jest.fn();
    const register2 = jest.fn();
    const register3 = jest.fn();

    await registry.registerModules([
        () => register1,
        () => register2,
        () => register3
    ], runtime);

    await registry.registerDeferredRegistrations(runtime, {});

    register1.mockReset();
    register2.mockReset();
    register2.mockReset();

    await registry.updateDeferredRegistrations(runtime, {});

    expect(register1).toHaveBeenCalled();
    expect(register2).toHaveBeenCalled();
    expect(register3).toHaveBeenCalled();
});

test("when a deferred registration is asynchronous, the function can be awaited", async () => {
    const registry = new LocalModuleRegistry();

    let hasBeenCompleted = false;

    await registry.registerModules([
        () => () => {},
        // Do not wait on the "registerDeferredRegistrations" call
        // but wait on the "updateDeferredRegistrations" call.
        () => jest.fn()
            .mockImplementationOnce(() => {})
            .mockImplementationOnce(async () => {
                await simulateDelay(10);

                hasBeenCompleted = true;
            }),
        () => () => {}
    ], runtime);

    await registry.registerDeferredRegistrations(runtime, {});

    await registry.updateDeferredRegistrations(runtime, {});

    expect(hasBeenCompleted).toBeTruthy();
});

test("when a deferred registration fail, update the remaining deferred registrations", async () => {
    const registry = new LocalModuleRegistry();

    const register1 = jest.fn();
    const register3 = jest.fn();

    await registry.registerModules([
        () => register1,
        // Do not throw on the "registerDeferredRegistrations" call
        // but throw on the "updateDeferredRegistrations" call.
        () => jest.fn()
            .mockImplementationOnce(() => {})
            .mockImplementationOnce(async () => {
                throw new Error("Module 2 registration failed");
            }),
        () => register3
    ], runtime);

    await registry.registerDeferredRegistrations(runtime, {});

    register1.mockReset();
    register3.mockReset();

    await registry.updateDeferredRegistrations(runtime, {});

    expect(register1).toHaveBeenCalled();
    expect(register3).toHaveBeenCalled();
});

test("when a deferred registration fail, return the error", async () => {
    const registry = new LocalModuleRegistry();

    await registry.registerModules([
        () => () => {},
        // Do not throw on the "registerDeferredRegistrations" call
        // but throw on the "updateDeferredRegistrations" call.
        () => jest.fn()
            .mockImplementationOnce(() => {})
            .mockImplementationOnce(async () => {
                throw new Error("Module 2 registration failed");
            }),
        () => () => {}
    ], runtime);

    await registry.registerDeferredRegistrations(runtime, {});

    const errors = await registry.updateDeferredRegistrations(runtime, {});

    expect(errors.length).toBe(1);
    expect(errors[0]!.error!.toString()).toContain("Module 2 registration failed");
});

test("all the deferred module registrations receive the data object", async () => {
    const registry = new LocalModuleRegistry();

    const register1 = jest.fn();
    const register2 = jest.fn();
    const register3 = jest.fn();

    await registry.registerModules([
        () => register1,
        () => register2,
        () => register3
    ], runtime);

    await registry.registerDeferredRegistrations(runtime, {});

    register1.mockReset();
    register2.mockReset();
    register3.mockReset();

    const data = {
        foo: "bar"
    };

    await registry.updateDeferredRegistrations(runtime, data);

    expect(register1).toHaveBeenCalledWith(data, "update");
    expect(register2).toHaveBeenCalledWith(data, "update");
    expect(register3).toHaveBeenCalledWith(data, "update");
});

test("all the deferred module registrations receive \"update\" as state", async () => {
    const registry = new LocalModuleRegistry();

    const register1 = jest.fn();
    const register2 = jest.fn();
    const register3 = jest.fn();

    await registry.registerModules([
        () => register1,
        () => register2,
        () => register3
    ], runtime);

    await registry.registerDeferredRegistrations(runtime, {});

    register1.mockReset();
    register2.mockReset();
    register3.mockReset();

    const data = {
        foo: "bar"
    };

    await registry.updateDeferredRegistrations(runtime, data);

    expect(register1).toHaveBeenCalledWith(data, "update");
    expect(register2).toHaveBeenCalledWith(data, "update");
    expect(register3).toHaveBeenCalledWith(data, "update");
});
