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
}

const runtime = new DummyRuntime();

test("when called before registerLocalModules, throw an error", async () => {
    const registry = new LocalModuleRegistry();

    await expect(() => registry.completeModuleRegistrations(runtime, {})).rejects.toThrow(/The completeLocalModuleRegistration function can only be called once the registerLocalModules function terminated/);
});

test("when called twice, throw an error", async () => {
    const registry = new LocalModuleRegistry();

    await registry.registerModules([
        () => () => {},
        () => () => {}
    ], runtime);

    await registry.completeModuleRegistrations(runtime, {});

    await expect(() => registry.completeModuleRegistrations(runtime, {})).rejects.toThrow(/The completeLocalModuleRegistration function can only be called once/);
});

test("when called for the first time but the registration status is already \"ready\", return a resolving promise", async () => {
    const registry = new LocalModuleRegistry();

    // When there's no deferred modules, the status should be "ready".
    await registry.registerModules([
        () => {},
        () => {}
    ], runtime);

    expect(registry.registrationStatus).toBe("ready");

    await registry.completeModuleRegistrations(runtime, {});

    expect(registry.registrationStatus).toBe("ready");
});

test("can complete all the deferred registrations", async () => {
    const registry = new LocalModuleRegistry();

    const register1 = jest.fn();
    const register2 = jest.fn();
    const register3 = jest.fn();

    await registry.registerModules([
        () => register1,
        () => register2,
        () => register3
    ], runtime);

    await registry.completeModuleRegistrations(runtime, {});

    expect(register1).toHaveBeenCalled();
    expect(register2).toHaveBeenCalled();
    expect(register3).toHaveBeenCalled();
});

test("when all the deferred registrations are completed, set the status to \"ready\"", async () => {
    const registry = new LocalModuleRegistry();

    await registry.registerModules([
        () => () => {},
        () => () => {}
    ], runtime);

    expect(registry.registrationStatus).toBe("registered");

    await registry.completeModuleRegistrations(runtime, {});

    expect(registry.registrationStatus).toBe("ready");
});

test("when a deferred registration is asynchronous, the function can be awaited", async () => {
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

    await registry.completeModuleRegistrations(runtime, {});

    expect(hasBeenCompleted).toBeTruthy();
});

test("when a deferred registration fail, complete the remaining deferred registrations", async () => {
    const registry = new LocalModuleRegistry();

    const register1 = jest.fn();
    const register3 = jest.fn();

    await registry.registerModules([
        () => register1,
        () => () => { throw new Error("Module 2 registration failed"); },
        () => register3
    ], runtime);

    await registry.completeModuleRegistrations(runtime, {});

    expect(register1).toHaveBeenCalled();
    expect(register3).toHaveBeenCalled();
});

test("when a deferred registration fail, return the error", async () => {
    const registry = new LocalModuleRegistry();

    await registry.registerModules([
        () => () => {},
        () => () => { throw new Error("Module 2 deferred registration failed"); },
        () => () => {}
    ], runtime);

    const errors = await registry.completeModuleRegistrations(runtime, {});

    expect(errors.length).toBe(1);
    expect(errors[0]!.error!.toString()).toContain("Module 2 deferred registration failed");
});

test("when data is provided, all the deferred module registrations receive the data object", async () => {
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

    await registry.completeModuleRegistrations(runtime, data);

    expect(register1).toHaveBeenCalledWith(data);
    expect(register2).toHaveBeenCalledWith(data);
    expect(register3).toHaveBeenCalledWith(data);
});


