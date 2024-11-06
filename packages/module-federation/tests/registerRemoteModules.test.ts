import { Runtime } from "@squide/core";
import { RemoteModuleRegistrationFailedEvent, RemoteModuleRegistry, RemoteModulesRegistrationCompletedEvent, RemoteModulesRegistrationStartedEvent } from "../src/registerRemoteModules.ts";

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

test("should register all the modules", async () => {
    const runtime = new DummyRuntime();

    const register1 = jest.fn();
    const register2 = jest.fn();
    const register3 = jest.fn();

    const loadRemote = jest.fn()
        .mockResolvedValueOnce({
            register: register1
        })
        .mockResolvedValueOnce({
            register: register2
        })
        .mockResolvedValueOnce({
            register: register3
        });

    const registry = new RemoteModuleRegistry(loadRemote);

    await registry.registerModules([
        { name: "Dummy-1" },
        { name: "Dummy-2" },
        { name: "Dummy-3" }
    ], runtime);

    expect(register1).toHaveBeenCalledTimes(1);
    expect(register2).toHaveBeenCalledTimes(1);
    expect(register3).toHaveBeenCalledTimes(1);
    expect(register1).toHaveBeenCalled();
    expect(register2).toHaveBeenCalled();
    expect(register3).toHaveBeenCalled();
});

test("when called twice, throw an error", async () => {
    const runtime = new DummyRuntime();

    const loadRemote = jest.fn().mockResolvedValue({
        register: () => {}
    });

    const registry = new RemoteModuleRegistry(loadRemote);

    await registry.registerModules([{ name: "Dummy-1" }], runtime);

    await expect(async () => registry.registerModules([{ name: "Dummy-1" }], runtime)).rejects.toThrow(/The registerRemoteModules function can only be called once/);
});

test("should dispatch RemoteModulesRegistrationStartedEvent", async () => {
    const runtime = new DummyRuntime();

    const listener = jest.fn();

    runtime.eventBus.addListener(RemoteModulesRegistrationStartedEvent, listener);

    const loadRemote = jest.fn().mockResolvedValue({
        register: () => {}
    });

    const registry = new RemoteModuleRegistry(loadRemote);

    await registry.registerModules([{ name: "Dummy-1" }], runtime);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({
        remoteCount: 1
    }));
});

test("when there are no deferred registrations, once all the modules are registered, set the status to \"ready\"", async () => {
    const runtime = new DummyRuntime();

    const loadRemote = jest.fn().mockResolvedValue({
        register: () => {}
    });

    const registry = new RemoteModuleRegistry(loadRemote);

    await registry.registerModules([
        { name: "Dummy-1" },
        { name: "Dummy-2" }
    ], runtime);

    expect(registry.registrationStatus).toBe("ready");
});

test("when there are no deferred registrations, once all the modules are registered, RemoteModulesRegistrationCompletedEvent is dispatched", async () => {
    const runtime = new DummyRuntime();

    const listener = jest.fn();

    runtime.eventBus.addListener(RemoteModulesRegistrationCompletedEvent, listener);

    const loadRemote = jest.fn().mockResolvedValue({
        register: () => {}
    });

    const registry = new RemoteModuleRegistry(loadRemote);

    await registry.registerModules([
        { name: "Dummy-1" },
        { name: "Dummy-2" }
    ], runtime);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({
        remoteCount: 2
    }));
});

test("when there are deferred registrations, once all the modules are registered, set the status to \"modules-registered\"", async () => {
    const runtime = new DummyRuntime();

    const loadRemote = jest.fn().mockResolvedValue({
        register: () => () => {}
    });

    const registry = new RemoteModuleRegistry(loadRemote);

    await registry.registerModules([
        { name: "Dummy-1" },
        { name: "Dummy-2" }
    ], runtime);

    expect(registry.registrationStatus).toBe("modules-registered");
});

test("when there are deferred registrations, once all the modules are registered, RemoteModulesRegistrationCompletedEvent is dispatched", async () => {
    const runtime = new DummyRuntime();

    const listener = jest.fn();

    runtime.eventBus.addListener(RemoteModulesRegistrationCompletedEvent, listener);

    const loadRemote = jest.fn().mockResolvedValue({
        register: () => () => {}
    });

    const registry = new RemoteModuleRegistry(loadRemote);

    await registry.registerModules([
        { name: "Dummy-1" },
        { name: "Dummy-2" }
    ], runtime);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({
        remoteCount: 2
    }));
});

test("when a module registration fail, register the remaining modules", async () => {
    const runtime = new DummyRuntime();

    const register1 = jest.fn();
    const register3 = jest.fn();

    const loadRemote = jest.fn()
        .mockResolvedValueOnce({
            register: register1
        })
        .mockResolvedValueOnce({
            register: () => { throw new Error("Module 2 registration failed"); }
        })
        .mockResolvedValueOnce({
            register: register3
        });

    const registry = new RemoteModuleRegistry(loadRemote);

    await registry.registerModules([
        { name: "Dummy-1" },
        { name: "Dummy-2" },
        { name: "Dummy-3" }
    ], runtime);

    expect(register1).toHaveBeenCalledTimes(1);
    expect(register3).toHaveBeenCalledTimes(1);
    expect(register1).toHaveBeenCalled();
    expect(register3).toHaveBeenCalled();
});

test("when a module registration fail, return the error", async () => {
    const runtime = new DummyRuntime();

    const loadRemote = jest.fn()
        .mockResolvedValueOnce({
            register: () => {}
        })
        .mockResolvedValueOnce({
            register: () => { throw new Error("Module 2 registration failed"); }
        })
        .mockResolvedValueOnce({
            register: () => {}
        });

    const registry = new RemoteModuleRegistry(loadRemote);

    const errors = await registry.registerModules([
        { name: "Dummy-1" },
        { name: "Dummy-2" },
        { name: "Dummy-3" }
    ], runtime);

    expect(errors.length).toBe(1);
    expect(errors[0]!.error!.toString()).toContain("Module 2 registration failed");
});

test("when a module registration fail, RemoteModuleRegistrationFailedEvent is dispatched", async () => {
    const runtime = new DummyRuntime();

    const listener = jest.fn();

    runtime.eventBus.addListener(RemoteModuleRegistrationFailedEvent, listener);

    const registrationError = new Error("Module 2 registration failed");

    const loadRemote = jest.fn()
        .mockResolvedValueOnce({
            register: () => {}
        })
        .mockResolvedValueOnce({
            register: () => { throw registrationError; }
        })
        .mockResolvedValueOnce({
            register: () => {}
        });

    const registry = new RemoteModuleRegistry(loadRemote);

    await registry.registerModules([
        { name: "Dummy-1" },
        { name: "Dummy-2" },
        { name: "Dummy-3" }
    ], runtime);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({
        error: registrationError
    }));
});

test("when a module registration fail, RemoteModulesRegistrationCompletedEvent is dispatched", async () => {
    const runtime = new DummyRuntime();

    const listener = jest.fn();

    runtime.eventBus.addListener(RemoteModulesRegistrationCompletedEvent, listener);

    const registrationError = new Error("Module 2 registration failed");

    const loadRemote = jest.fn()
        .mockResolvedValueOnce({
            register: () => {}
        })
        .mockResolvedValueOnce({
            register: () => { throw registrationError; }
        })
        .mockResolvedValueOnce({
            register: () => {}
        });

    const registry = new RemoteModuleRegistry(loadRemote);

    await registry.registerModules([
        { name: "Dummy-1" },
        { name: "Dummy-2" },
        { name: "Dummy-3" }
    ], runtime);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({
        remoteCount: 2
    }));
});

test("when a context is provided, all the register functions receive the provided context", async () => {
    const runtime = new DummyRuntime();

    const register1 = jest.fn();
    const register2 = jest.fn();
    const register3 = jest.fn();

    const loadRemote = jest.fn()
        .mockResolvedValueOnce({
            register: register1
        })
        .mockResolvedValueOnce({
            register: register2
        })
        .mockResolvedValueOnce({
            register: register3
        });

    const registry = new RemoteModuleRegistry(loadRemote);

    const context = {
        foo: "bar"
    };

    await registry.registerModules([
        { name: "Dummy-1" },
        { name: "Dummy-2" },
        { name: "Dummy-3" }
    ], runtime, { context });

    expect(register1).toHaveBeenCalledTimes(1);
    expect(register2).toHaveBeenCalledTimes(1);
    expect(register3).toHaveBeenCalledTimes(1);
    expect(register1).toHaveBeenCalledWith(runtime, context);
    expect(register2).toHaveBeenCalledWith(runtime, context);
    expect(register3).toHaveBeenCalledWith(runtime, context);
});

test("when no modules are provided, the status is \"ready\"", async () => {
    const runtime = new DummyRuntime();
    const registry = new RemoteModuleRegistry(jest.fn());

    await registry.registerModules([], runtime);

    expect(registry.registrationStatus).toBe("ready");
});

test("when no modules are provided, do not dispatch RemoteModulesRegistrationStartedEvent", async () => {
    const runtime = new DummyRuntime();

    const listener = jest.fn();

    runtime.eventBus.addListener(RemoteModulesRegistrationStartedEvent, listener);

    const registry = new RemoteModuleRegistry(jest.fn());

    await registry.registerModules([], runtime);

    expect(listener).not.toHaveBeenCalled();
});

test("when no modules are provided, do not dispatch RemoteModulesRegistrationCompletedEvent", async () => {
    const runtime = new DummyRuntime();

    const listener = jest.fn();

    runtime.eventBus.addListener(RemoteModulesRegistrationCompletedEvent, listener);

    const registry = new RemoteModuleRegistry(jest.fn());

    await registry.registerModules([], runtime);

    expect(listener).not.toHaveBeenCalled();
});
