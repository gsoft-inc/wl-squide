import { LocalModuleDeferredRegistrationFailedEvent, LocalModuleRegistry, LocalModulesDeferredRegistrationCompletedEvent, LocalModulesDeferredRegistrationStartedEvent } from "../src/registration/registerLocalModules.ts";
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

    await expect(() => registry.registerDeferredRegistrations({}, runtime)).rejects.toThrow(/The registerDeferredRegistrations function can only be called once the local modules are registered/);
});

test("when called twice, throw an error", async () => {
    const runtime = new DummyRuntime();
    const registry = new LocalModuleRegistry();

    await registry.registerModules([
        () => () => {},
        () => () => {}
    ], runtime);

    await registry.registerDeferredRegistrations({}, runtime);

    await expect(() => registry.registerDeferredRegistrations({}, runtime)).rejects.toThrow(/The registerDeferredRegistrations function can only be called once/);
});

test("when called for the first time but the registration status is already \"ready\", return a resolving promise", async () => {
    const runtime = new DummyRuntime();
    const registry = new LocalModuleRegistry();

    // When there's no deferred modules, the status should be "ready".
    await registry.registerModules([
        () => {},
        () => {}
    ], runtime);

    expect(registry.registrationStatus).toBe("ready");

    await registry.registerDeferredRegistrations({}, runtime);

    expect(registry.registrationStatus).toBe("ready");
});

test("should dispatch LocalModulesDeferredRegistrationStartedEvent", async () => {
    const runtime = new DummyRuntime();

    const listener = jest.fn();

    runtime.eventBus.addListener(LocalModulesDeferredRegistrationStartedEvent, listener);

    const registry = new LocalModuleRegistry();

    await registry.registerModules([
        () => () => {},
        () => () => {}
    ], runtime);

    await registry.registerDeferredRegistrations({}, runtime);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({
        registrationCount: 2
    }));
});

test("should register all the deferred registrations", async () => {
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

    expect(register1).toHaveBeenCalled();
    expect(register2).toHaveBeenCalled();
    expect(register3).toHaveBeenCalled();
});

test("when all the deferred registrations are registered, set the status to \"ready\"", async () => {
    const runtime = new DummyRuntime();
    const registry = new LocalModuleRegistry();

    await registry.registerModules([
        () => () => {},
        () => () => {}
    ], runtime);

    expect(registry.registrationStatus).toBe("modules-registered");

    await registry.registerDeferredRegistrations({}, runtime);

    expect(registry.registrationStatus).toBe("ready");
});

test("when all the deferred registrations are registered, LocalModulesDeferredRegistrationCompletedEvent is dispatched", async () => {
    const runtime = new DummyRuntime();

    const listener = jest.fn();

    runtime.eventBus.addListener(LocalModulesDeferredRegistrationCompletedEvent, listener);

    const registry = new LocalModuleRegistry();

    await registry.registerModules([
        () => () => {},
        () => () => {}
    ], runtime);

    await registry.registerDeferredRegistrations({}, runtime);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({
        registrationCount: 2
    }));
});

test("when a deferred registration is asynchronous, the function can be awaited", async () => {
    const runtime = new DummyRuntime();
    const registry = new LocalModuleRegistry();

    let hasBeenCompleted = false;

    await registry.registerModules([
        () => () => {},
        () => async () => {
            await simulateDelay(10);

            hasBeenCompleted = true;
        },
        () => () => {}
    ], runtime);

    await registry.registerDeferredRegistrations({}, runtime);

    expect(hasBeenCompleted).toBeTruthy();
});

test("when a deferred registration fail, register the remaining deferred registrations", async () => {
    const runtime = new DummyRuntime();
    const registry = new LocalModuleRegistry();

    const register1 = jest.fn();
    const register3 = jest.fn();

    await registry.registerModules([
        () => register1,
        () => () => { throw new Error("Module 2 registration failed"); },
        () => register3
    ], runtime);

    await registry.registerDeferredRegistrations({}, runtime);

    expect(register1).toHaveBeenCalled();
    expect(register3).toHaveBeenCalled();
});

test("when a deferred registration fail, return the error", async () => {
    const runtime = new DummyRuntime();
    const registry = new LocalModuleRegistry();

    await registry.registerModules([
        () => () => {},
        () => () => { throw new Error("Module 2 deferred registration failed"); },
        () => () => {}
    ], runtime);

    const errors = await registry.registerDeferredRegistrations({}, runtime);

    expect(errors.length).toBe(1);
    expect(errors[0]!.error!.toString()).toContain("Module 2 deferred registration failed");
});

test("when a deferred registration fail, LocalModuleDeferredRegistrationFailedEvent is dispatched", async () => {
    const runtime = new DummyRuntime();

    const listener = jest.fn();

    runtime.eventBus.addListener(LocalModuleDeferredRegistrationFailedEvent, listener);

    const registry = new LocalModuleRegistry();
    const registrationError = new Error("Module 2 registration failed");

    await registry.registerModules([
        () => () => {},
        () => () => { throw registrationError; },
        () => () => {}
    ], runtime);

    await registry.registerDeferredRegistrations({}, runtime);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({
        error: registrationError
    }));
});

test("when a deferred registration fail, LocalModulesDeferredRegistrationCompletedEvent is dispatched", async () => {
    const runtime = new DummyRuntime();

    const listener = jest.fn();

    runtime.eventBus.addListener(LocalModulesDeferredRegistrationCompletedEvent, listener);

    const registry = new LocalModuleRegistry();
    const registrationError = new Error("Module 2 registration failed");

    await registry.registerModules([
        () => () => {},
        () => () => { throw registrationError; },
        () => () => {}
    ], runtime);

    await registry.registerDeferredRegistrations({}, runtime);

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

    const data = {
        foo: "bar"
    };

    await registry.registerDeferredRegistrations(data, runtime);

    expect(register1).toHaveBeenCalledWith(data, "register");
    expect(register2).toHaveBeenCalledWith(data, "register");
    expect(register3).toHaveBeenCalledWith(data, "register");
});

test("all the deferred module registrations receive \"register\" as state", async () => {
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

    const data = {
        foo: "bar"
    };

    await registry.registerDeferredRegistrations(data, runtime);

    expect(register1).toHaveBeenCalledWith(data, "register");
    expect(register2).toHaveBeenCalledWith(data, "register");
    expect(register3).toHaveBeenCalledWith(data, "register");
});


