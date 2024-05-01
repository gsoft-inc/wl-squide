import { Runtime } from "@squide/core";
import { RemoteModuleRegistry } from "../src/registerRemoteModules.ts";

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
}

const runtime = new DummyRuntime();

test("can register all the modules", async () => {
    const register1 = jest.fn();
    const register2 = jest.fn();
    const register3 = jest.fn();

    const loadRemote = jest.fn();

    loadRemote
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

    expect(register1).toHaveBeenCalled();
    expect(register2).toHaveBeenCalled();
    expect(register3).toHaveBeenCalled();
});

test("when called twice, throw an error", async () => {
    const loadRemote = jest.fn().mockResolvedValue({
        register: () => {}
    });

    const registry = new RemoteModuleRegistry(loadRemote);

    await registry.registerModules([{ name: "Dummy-1" }], runtime);

    await expect(async () => registry.registerModules([{ name: "Dummy-1" }], runtime)).rejects.toThrow(/The registerRemoteModules function can only be called once/);
});

test("when there are no deferred registrations, once all the modules are registered, set the status to \"ready\"", async () => {
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

test("when there are deferred registrations, once all the modules are registered, set the status to \"registered\"", async () => {
    const loadRemote = jest.fn().mockResolvedValue({
        register: () => () => {}
    });

    const registry = new RemoteModuleRegistry(loadRemote);

    await registry.registerModules([
        { name: "Dummy-1" },
        { name: "Dummy-2" }
    ], runtime);

    expect(registry.registrationStatus).toBe("registered");
});

test("when a module registration fail, register the remaining modules", async () => {
    const register1 = jest.fn();
    const register3 = jest.fn();

    const loadRemote = jest.fn();

    loadRemote
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

    expect(register1).toHaveBeenCalled();
    expect(register3).toHaveBeenCalled();
});

test("when a module registration fail, return the error", async () => {
    const loadRemote = jest.fn();

    loadRemote
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
