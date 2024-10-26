import { LocalModuleRegistrationFailedEvent, LocalModuleRegistry, LocalModulesRegistrationCompletedEvent, LocalModulesRegistrationStartedEvent } from "../src/registration/registerLocalModules.ts";
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

test("can register all the modules", async () => {
    const runtime = new DummyRuntime();
    const registry = new LocalModuleRegistry();

    const register1 = jest.fn();
    const register2 = jest.fn();
    const register3 = jest.fn();

    await registry.registerModules([
        register1,
        register2,
        register3
    ], runtime);

    expect(register1).toHaveBeenCalled();
    expect(register2).toHaveBeenCalled();
    expect(register3).toHaveBeenCalled();
});

test("when a module is asynchronous, the function can be awaited", async () => {
    const runtime = new DummyRuntime();
    const registry = new LocalModuleRegistry();

    let hasBeenCompleted = false;

    await registry.registerModules([
        () => {},
        async () => {
            await simulateDelay(10);

            hasBeenCompleted = true;
        },
        () => {}
    ], runtime);

    expect(hasBeenCompleted).toBeTruthy();
});

test("when called twice, throw an error", async () => {
    const runtime = new DummyRuntime();
    const registry = new LocalModuleRegistry();

    await registry.registerModules([() => {}], runtime);

    await expect(async () => registry.registerModules([() => {}], runtime)).rejects.toThrow(/The registerLocalModules function can only be called once/);
});

test("dispatch LocalModulesRegistrationStartedEvent", async () => {
    const runtime = new DummyRuntime();

    const listener = jest.fn();

    runtime.eventBus.addListener(LocalModulesRegistrationStartedEvent, listener);

    const registry = new LocalModuleRegistry();

    await registry.registerModules([
        () => {},
        () => {}
    ], runtime);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({
        moduleCount: 2
    }));
});

test("when there are no deferred registrations, once all the modules are registered, set the status to \"ready\"", async () => {
    const runtime = new DummyRuntime();
    const registry = new LocalModuleRegistry();

    await registry.registerModules([
        () => {},
        () => {}
    ], runtime);

    expect(registry.registrationStatus).toBe("ready");
});

test("when there are no deferred registrations, once all the modules are registered, LocalModulesRegistrationCompletedEvent is dispatched", async () => {
    const runtime = new DummyRuntime();

    const listener = jest.fn();

    runtime.eventBus.addListener(LocalModulesRegistrationCompletedEvent, listener);

    const registry = new LocalModuleRegistry();

    await registry.registerModules([
        () => {},
        () => {}
    ], runtime);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({
        moduleCount: 2
    }));
});

test("when there are deferred registrations, once all the modules are registered, set the status to \"modules-registered\"", async () => {
    const runtime = new DummyRuntime();
    const registry = new LocalModuleRegistry();

    await registry.registerModules([
        () => {},
        () => () => {}
    ], runtime);

    expect(registry.registrationStatus).toBe("modules-registered");
});

test("when there are deferred registrations, once all the modules are registered, LocalModulesRegistrationCompletedEvent is dispatched", async () => {
    const runtime = new DummyRuntime();

    const listener = jest.fn();

    runtime.eventBus.addListener(LocalModulesRegistrationCompletedEvent, listener);

    const registry = new LocalModuleRegistry();

    await registry.registerModules([
        () => {},
        () => () => {}
    ], runtime);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({
        moduleCount: 2
    }));
});

test("when a module registration fail, register the remaining modules", async () => {
    const runtime = new DummyRuntime();
    const registry = new LocalModuleRegistry();

    const register1 = jest.fn();
    const register3 = jest.fn();

    await registry.registerModules([
        register1,
        () => { throw new Error("Module 2 registration failed"); },
        register3
    ], runtime);

    expect(register1).toHaveBeenCalled();
    expect(register3).toHaveBeenCalled();
});

test("when a module registration fail, return the error", async () => {
    const runtime = new DummyRuntime();
    const registry = new LocalModuleRegistry();

    const errors = await registry.registerModules([
        () => {},
        () => { throw new Error("Module 2 registration failed"); },
        () => {}
    ], runtime);

    expect(errors.length).toBe(1);
    expect(errors[0]!.error!.toString()).toContain("Module 2 registration failed");
});

test("when a module registration fail, LocalModuleRegistrationFailedEvent is dispatched", async () => {
    const runtime = new DummyRuntime();

    const listener = jest.fn();

    runtime.eventBus.addListener(LocalModuleRegistrationFailedEvent, listener);

    const registry = new LocalModuleRegistry();
    const registrationError = new Error("Module 2 registration failed");

    await registry.registerModules([
        () => {},
        () => { throw registrationError; },
        () => {}
    ], runtime);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({
        error: registrationError
    }));
});

test("when a module registration fail, LocalModulesRegistrationCompletedEvent is dispatched", async () => {
    const runtime = new DummyRuntime();

    const listener = jest.fn();

    runtime.eventBus.addListener(LocalModulesRegistrationCompletedEvent, listener);

    const registry = new LocalModuleRegistry();
    const registrationError = new Error("Module 2 registration failed");

    await registry.registerModules([
        () => {},
        () => { throw registrationError; },
        () => {}
    ], runtime);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({
        moduleCount: 2
    }));
});

test("when a context is provided, all the register functions receive the provided context", async () => {
    const runtime = new DummyRuntime();

    const register1 = jest.fn();
    const register2 = jest.fn();
    const register3 = jest.fn();

    const registry = new LocalModuleRegistry();

    const context = {
        foo: "bar"
    };

    await registry.registerModules([
        register1,
        register2,
        register3
    ], runtime, { context });

    expect(register1).toHaveBeenCalledWith(runtime, context);
    expect(register2).toHaveBeenCalledWith(runtime, context);
    expect(register3).toHaveBeenCalledWith(runtime, context);
});

test("when no modules are provided, the status remain \"none\"", async () => {
    const runtime = new DummyRuntime();
    const registry = new LocalModuleRegistry();

    await registry.registerModules([], runtime);

    expect(registry.registrationStatus).toBe("none");
});

test("when no modules are provided, do not dispatch LocalModulesRegistrationStartedEvent", async () => {
    const runtime = new DummyRuntime();

    const listener = jest.fn();

    runtime.eventBus.addListener(LocalModulesRegistrationStartedEvent, listener);

    const registry = new LocalModuleRegistry();

    await registry.registerModules([], runtime);

    expect(listener).not.toHaveBeenCalled();
});

test("when no modules are provided, do not dispatch LocalModulesRegistrationCompletedEvent", async () => {
    const runtime = new DummyRuntime();

    const listener = jest.fn();

    runtime.eventBus.addListener(LocalModulesRegistrationCompletedEvent, listener);

    const registry = new LocalModuleRegistry();

    await registry.registerModules([], runtime);

    expect(listener).not.toHaveBeenCalled();
});


