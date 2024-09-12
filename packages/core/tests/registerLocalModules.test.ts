import { LocalModuleRegistry } from "../src/registration/registerLocalModules.ts";
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

const runtime = new DummyRuntime();

test("can register all the modules", async () => {
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
    const registry = new LocalModuleRegistry();

    await registry.registerModules([() => {}], runtime);

    await expect(async () => registry.registerModules([() => {}], runtime)).rejects.toThrow(/The registerLocalModules function can only be called once/);
});

test("when there are no deferred registrations, once all the modules are registered, set the status to \"ready\"", async () => {
    const registry = new LocalModuleRegistry();

    await registry.registerModules([
        () => {},
        () => {}
    ], runtime);

    expect(registry.registrationStatus).toBe("ready");
});

test("when there are deferred registrations, once all the modules are registered, set the status to \"modules-registered\"", async () => {
    const registry = new LocalModuleRegistry();

    await registry.registerModules([
        () => {},
        () => () => {}
    ], runtime);

    expect(registry.registrationStatus).toBe("modules-registered");
});

test("when a module registration fail, register the remaining modules", async () => {
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
    const registry = new LocalModuleRegistry();

    const errors = await registry.registerModules([
        () => {},
        () => { throw new Error("Module 2 registration failed"); },
        () => {}
    ], runtime);

    expect(errors.length).toBe(1);
    expect(errors[0]!.error!.toString()).toContain("Module 2 registration failed");
});

test("when a context is provided, all the register functions receive the provided context", async () => {
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


