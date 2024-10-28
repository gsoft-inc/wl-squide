import { LocalModuleDeferredRegistrationUpdateFailedEvent, LocalModuleRegistry, LocalModulesDeferredRegistrationsUpdateCompletedEvent, LocalModulesDeferredRegistrationsUpdateStartedEvent } from "../src/registration/registerLocalModules.ts";
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

    registerPublicRoute() {
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

test("when called before registerLocalModules, throw an error", async () => {
    const runtime = new DummyRuntime();
    const registry = new LocalModuleRegistry();

    await expect(() => registry.updateDeferredRegistrations({}, runtime)).rejects.toThrow(/The updateDeferredRegistrations function can only be called once the local modules are ready/);
});

test("when called before registerLocalModuleDeferredRegistrations, throw an error", async () => {
    const runtime = new DummyRuntime();
    const registry = new LocalModuleRegistry();

    await registry.registerModules([
        () => () => {},
        () => () => {},
        () => () => {}
    ], runtime);

    await expect(() => registry.updateDeferredRegistrations({}, runtime)).rejects.toThrow(/The updateDeferredRegistrations function can only be called once the local modules are ready/);
});

test("dispatch LocalModulesDeferredRegistrationsUpdateStartedEvent", async () => {
    const runtime = new DummyRuntime();

    const listener = jest.fn();

    runtime.eventBus.addListener(LocalModulesDeferredRegistrationsUpdateStartedEvent, listener);

    const registry = new LocalModuleRegistry();

    await registry.registerModules([
        () => () => {},
        () => () => {},
        () => () => {}
    ], runtime);

    await registry.registerDeferredRegistrations({}, runtime);
    await registry.updateDeferredRegistrations({}, runtime);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({
        registrationCount: 3
    }));
});

test("can update all the deferred registrations", async () => {
    const runtime = new DummyRuntime();
    const registry = new LocalModuleRegistry();

    const register1 = jest.fn();
    const register2 = jest.fn();
    const register3 = jest.fn();

    await registry.registerModules([
        () => register1,
        () => register2,
        () => register3
    ], runtime);

    await registry.registerDeferredRegistrations({}, runtime);

    register1.mockReset();
    register2.mockReset();
    register3.mockReset();

    await registry.updateDeferredRegistrations({}, runtime);

    expect(register1).toHaveBeenCalledTimes(1);
    expect(register2).toHaveBeenCalledTimes(1);
    expect(register3).toHaveBeenCalledTimes(1);
});

test("when all deferred registrations has been updated, LocalModulesDeferredRegistrationsUpdateCompletedEvent is dispatched", async () => {
    const runtime = new DummyRuntime();

    const listener = jest.fn();

    runtime.eventBus.addListener(LocalModulesDeferredRegistrationsUpdateCompletedEvent, listener);

    const registry = new LocalModuleRegistry();

    await registry.registerModules([
        () => () => {},
        () => () => {},
        () => () => {}
    ], runtime);

    await registry.registerDeferredRegistrations({}, runtime);
    await registry.updateDeferredRegistrations({}, runtime);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({
        registrationCount: 3
    }));
});

test("when a deferred registration is asynchronous, the function can be awaited", async () => {
    const runtime = new DummyRuntime();
    const registry = new LocalModuleRegistry();

    let hasBeenCompleted = false;

    await registry.registerModules([
        () => () => {},
        // Do not wait on the "registerDeferredRegistrations" call but wait on the "updateDeferredRegistrations" call.
        () => jest.fn()
            .mockImplementationOnce(() => {})
            .mockImplementationOnce(async () => {
                await simulateDelay(10);

                hasBeenCompleted = true;
            }),
        () => () => {}
    ], runtime);

    await registry.registerDeferredRegistrations({}, runtime);

    await registry.updateDeferredRegistrations({}, runtime);

    expect(hasBeenCompleted).toBeTruthy();
});

test("when a deferred registration fail, update the remaining deferred registrations", async () => {
    const runtime = new DummyRuntime();
    const registry = new LocalModuleRegistry();

    const register1 = jest.fn();
    const register3 = jest.fn();

    await registry.registerModules([
        () => register1,
        // Do not throw on the "registerDeferredRegistrations" call but throw on the "updateDeferredRegistrations" call.
        () => jest.fn()
            .mockImplementationOnce(() => {})
            .mockImplementationOnce(async () => {
                throw new Error("Module 2 registration failed");
            }),
        () => register3
    ], runtime);

    await registry.registerDeferredRegistrations({}, runtime);

    register1.mockReset();
    register3.mockReset();

    await registry.updateDeferredRegistrations({}, runtime);

    expect(register1).toHaveBeenCalledTimes(1);
    expect(register3).toHaveBeenCalledTimes(1);
});

test("when a deferred registration fail, return the error", async () => {
    const runtime = new DummyRuntime();
    const registry = new LocalModuleRegistry();

    await registry.registerModules([
        () => () => {},
        // Do not throw on the "registerDeferredRegistrations" call but throw on the "updateDeferredRegistrations" call.
        () => jest.fn()
            .mockImplementationOnce(() => {})
            .mockImplementationOnce(async () => {
                throw new Error("Module 2 registration failed");
            }),
        () => () => {}
    ], runtime);

    await registry.registerDeferredRegistrations({}, runtime);

    const errors = await registry.updateDeferredRegistrations({}, runtime);

    expect(errors.length).toBe(1);
    expect(errors[0]!.error!.toString()).toContain("Module 2 registration failed");
});

test("when a deferred registration fail, LocalModuleDeferredRegistrationUpdateFailedEvent is dispatched", async () => {
    const runtime = new DummyRuntime();

    const listener = jest.fn();

    runtime.eventBus.addListener(LocalModuleDeferredRegistrationUpdateFailedEvent, listener);

    const registry = new LocalModuleRegistry();
    const registrationError = new Error("Module 2 registration failed");

    await registry.registerModules([
        () => () => {},
        // Do not throw on the "registerDeferredRegistrations" call but throw on the "updateDeferredRegistrations" call.
        () => jest.fn()
            .mockImplementationOnce(() => {})
            .mockImplementationOnce(async () => {
                throw registrationError;
            }),
        () => () => {}
    ], runtime);

    await registry.registerDeferredRegistrations({}, runtime);
    await registry.updateDeferredRegistrations({}, runtime);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({
        error: registrationError
    }));
});

test("when a deferred registration fail, LocalModulesDeferredRegistrationsUpdateCompletedEvent is dispatched", async () => {
    const runtime = new DummyRuntime();

    const listener = jest.fn();

    runtime.eventBus.addListener(LocalModulesDeferredRegistrationsUpdateCompletedEvent, listener);

    const registry = new LocalModuleRegistry();
    const registrationError = new Error("Module 2 registration failed");

    await registry.registerModules([
        () => () => {},
        // Do not throw on the "registerDeferredRegistrations" call but throw on the "updateDeferredRegistrations" call.
        () => jest.fn()
            .mockImplementationOnce(() => {})
            .mockImplementationOnce(async () => {
                throw registrationError;
            }),
        () => () => {}
    ], runtime);

    await registry.registerDeferredRegistrations({}, runtime);
    await registry.updateDeferredRegistrations({}, runtime);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({
        registrationCount: 2
    }));
});

test("all the deferred module registrations receive the data object", async () => {
    const runtime = new DummyRuntime();
    const registry = new LocalModuleRegistry();

    const register1 = jest.fn();
    const register2 = jest.fn();
    const register3 = jest.fn();

    await registry.registerModules([
        () => register1,
        () => register2,
        () => register3
    ], runtime);

    await registry.registerDeferredRegistrations({}, runtime);

    register1.mockReset();
    register2.mockReset();
    register3.mockReset();

    const data = {
        foo: "bar"
    };

    await registry.updateDeferredRegistrations(data, runtime);

    expect(register1).toHaveBeenCalledTimes(1);
    expect(register2).toHaveBeenCalledTimes(1);
    expect(register3).toHaveBeenCalledTimes(1);
    expect(register1).toHaveBeenCalledWith(data, "update");
    expect(register2).toHaveBeenCalledWith(data, "update");
    expect(register3).toHaveBeenCalledWith(data, "update");
});

test("all the deferred module registrations receive \"update\" as state", async () => {
    const runtime = new DummyRuntime();
    const registry = new LocalModuleRegistry();

    const register1 = jest.fn();
    const register2 = jest.fn();
    const register3 = jest.fn();

    await registry.registerModules([
        () => register1,
        () => register2,
        () => register3
    ], runtime);

    await registry.registerDeferredRegistrations({}, runtime);

    register1.mockReset();
    register2.mockReset();
    register3.mockReset();

    const data = {
        foo: "bar"
    };

    await registry.updateDeferredRegistrations(data, runtime);

    expect(register1).toHaveBeenCalledTimes(1);
    expect(register2).toHaveBeenCalledTimes(1);
    expect(register3).toHaveBeenCalledTimes(1);
    expect(register1).toHaveBeenCalledWith(data, "update");
    expect(register2).toHaveBeenCalledWith(data, "update");
    expect(register3).toHaveBeenCalledWith(data, "update");
});
