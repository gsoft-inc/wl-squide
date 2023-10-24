import { AbstractRuntime } from "@squide/core";
import { RemoteModuleRegistry } from "../src/registerRemoteModules.ts";

function simulateDelay(delay: number) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(undefined);
        }, delay);
    });
}

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

const runtime = new DummyRuntime();

test("when called before registerRemoteModules, throw an error", async () => {
    const registry = new RemoteModuleRegistry(jest.fn());

    await expect(() => registry.completeRegistrations(runtime)).rejects.toThrow(/The completeRemoteModuleRegistration function can only be called once the registerRemoteModules function terminated/);
});

test("when called twice, throw an error", async () => {
    const loadRemote = jest.fn().mockResolvedValue({
        register: () => () => {}
    });

    const registry = new RemoteModuleRegistry(loadRemote);

    await registry.registerModules([
        { name: "Dummy-1", url: "http://anything1.com" },
        { name: "Dummy-2", url: "http://anything2.com" }
    ], runtime);

    await registry.completeRegistrations(runtime);

    await expect(() => registry.completeRegistrations(runtime)).rejects.toThrow(/The completeRemoteModuleRegistration function can only be called once/);
});

test("when called for the first time but the registration status is already \"ready\", return a resolving promise", async () => {
    // When there's no deferred modules, the status should be "ready".
    const loadRemote = jest.fn().mockResolvedValue({
        register: () => {}
    });

    const registry = new RemoteModuleRegistry(loadRemote);

    await registry.registerModules([
        { name: "Dummy-1", url: "http://anything1.com" },
        { name: "Dummy-2", url: "http://anything2.com" }
    ], runtime);

    expect(registry.registrationStatus).toBe("ready");

    await registry.completeRegistrations(runtime);

    expect(registry.registrationStatus).toBe("ready");
});

test("can complete all the deferred modules registration", async () => {
    const register1 = jest.fn();
    const register2 = jest.fn();
    const register3 = jest.fn();

    const loadRemote = jest.fn();

    loadRemote
        .mockResolvedValueOnce({
            register: () => register1
        })
        .mockResolvedValueOnce({
            register: () => register2
        })
        .mockResolvedValueOnce({
            register: () => register3
        });

    const registry = new RemoteModuleRegistry(loadRemote);

    await registry.registerModules([
        { name: "Dummy-1", url: "http://anything1.com" },
        { name: "Dummy-2", url: "http://anything2.com" },
        { name: "Dummy-3", url: "http://anything3.com" }
    ], runtime);

    await registry.completeRegistrations(runtime);

    expect(register1).toHaveBeenCalled();
    expect(register2).toHaveBeenCalled();
    expect(register3).toHaveBeenCalled();
});

test("when all the deferred modules are registered, set the status to \"ready\"", async () => {
    const loadRemote = jest.fn().mockResolvedValue({
        register: () => () => {}
    });

    const registry = new RemoteModuleRegistry(loadRemote);

    await registry.registerModules([
        { name: "Dummy-1", url: "http://anything1.com" },
        { name: "Dummy-2", url: "http://anything2.com" },
        { name: "Dummy-3", url: "http://anything3.com" }
    ], runtime);

    expect(registry.registrationStatus).toBe("registered");

    await registry.completeRegistrations(runtime);

    expect(registry.registrationStatus).toBe("ready");
});

test("when a deferred module is asynchronous, the function can be awaited", async () => {
    const loadRemote = jest.fn();

    loadRemote
        .mockResolvedValueOnce({
            register: () => () => {}
        })
        .mockResolvedValueOnce({
            register: () => async () => {
                await simulateDelay(10);

                hasBeenCompleted = true;
            }
        })
        .mockResolvedValueOnce({
            register: () => () => {}
        });

    const registry = new RemoteModuleRegistry(loadRemote);

    let hasBeenCompleted = false;

    await registry.registerModules([
        { name: "Dummy-1", url: "http://anything1.com" },
        { name: "Dummy-2", url: "http://anything2.com" },
        { name: "Dummy-3", url: "http://anything3.com" }
    ], runtime);

    await registry.completeRegistrations(runtime);

    expect(hasBeenCompleted).toBeTruthy();
});

test("when a deferred module registration fail, register the remaining deferred modules", async () => {
    const register1 = jest.fn();
    const register3 = jest.fn();

    const loadRemote = jest.fn();

    loadRemote
        .mockResolvedValueOnce({
            register: () => register1
        })
        .mockResolvedValueOnce({
            register: () => () => { throw new Error("Module 2 registration failed"); }
        })
        .mockResolvedValueOnce({
            register: () => register3
        });

    const registry = new RemoteModuleRegistry(loadRemote);

    await registry.registerModules([
        { name: "Dummy-1", url: "http://anything1.com" },
        { name: "Dummy-2", url: "http://anything2.com" },
        { name: "Dummy-3", url: "http://anything3.com" }
    ], runtime);

    await registry.completeRegistrations(runtime);

    expect(register1).toHaveBeenCalled();
    expect(register3).toHaveBeenCalled();
});

test("when a deferred module registration fail, return the error", async () => {
    const loadRemote = jest.fn();

    loadRemote
        .mockResolvedValueOnce({
            register: () => () => {}
        })
        .mockResolvedValueOnce({
            register: () => () => { throw new Error("Module 2 registration failed"); }
        })
        .mockResolvedValueOnce({
            register: () => () => {}
        });

    const registry = new RemoteModuleRegistry(loadRemote);

    await registry.registerModules([
        { name: "Dummy-1", url: "http://anything1.com" },
        { name: "Dummy-2", url: "http://anything2.com" },
        { name: "Dummy-3", url: "http://anything3.com" }
    ], runtime);

    const errors = await registry.completeRegistrations(runtime);

    expect(errors.length).toBe(1);
    expect(errors[0]!.error!.toString()).toContain("Module 2 registration failed");
});

test("when data is provided, all the deferred module registrations receive the data object", async () => {
    const register1 = jest.fn();
    const register2 = jest.fn();
    const register3 = jest.fn();

    const loadRemote = jest.fn();

    loadRemote
        .mockResolvedValueOnce({
            register: () => register1
        })
        .mockResolvedValueOnce({
            register: () => register2
        })
        .mockResolvedValueOnce({
            register: () => register3
        });

    const registry = new RemoteModuleRegistry(loadRemote);

    await registry.registerModules([
        { name: "Dummy-1", url: "http://anything1.com" },
        { name: "Dummy-2", url: "http://anything2.com" },
        { name: "Dummy-3", url: "http://anything3.com" }
    ], runtime);

    const data = {
        foo: "bar"
    };

    await registry.completeRegistrations(runtime, data);

    expect(register1).toHaveBeenCalledWith(data);
    expect(register2).toHaveBeenCalledWith(data);
    expect(register3).toHaveBeenCalledWith(data);
});


