import { LocalModuleRegistry, Runtime } from "@squide/core";
import { areModulesRegistered } from "../src/areModulesRegistered.ts";
import { RemoteModuleRegistry } from "../src/registerRemoteModules.ts";

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

test("when no modules are registered, return false", () => {
    const localModuleRegistry = new LocalModuleRegistry();

    const remoteModuleRegistry = new RemoteModuleRegistry(jest.fn().mockResolvedValue({
        register: () => {}
    }));

    expect(areModulesRegistered(localModuleRegistry.registrationStatus, remoteModuleRegistry.registrationStatus)).toBeFalsy();
});

test("when only local modules are registered, return true", async () => {
    const localModuleRegistry = new LocalModuleRegistry();

    const remoteModuleRegistry = new RemoteModuleRegistry(jest.fn().mockResolvedValue({
        register: () => {}
    }));

    await localModuleRegistry.registerModules([
        () => {},
        () => {},
        () => {}
    ], runtime);

    expect(areModulesRegistered(localModuleRegistry.registrationStatus, remoteModuleRegistry.registrationStatus)).toBeTruthy();
});

test("when only remote modules are registered, return true", async () => {
    const localModuleRegistry = new LocalModuleRegistry();

    const remoteModuleRegistry = new RemoteModuleRegistry(jest.fn().mockResolvedValue({
        register: () => {}
    }));

    await remoteModuleRegistry.registerModules([
        { name: "Dummy-1" },
        { name: "Dummy-2" },
        { name: "Dummy-3" }
    ], runtime);

    expect(areModulesRegistered(localModuleRegistry.registrationStatus, remoteModuleRegistry.registrationStatus)).toBeTruthy();
});

test("when local modules and remote modules are registered, return true", async () => {
    const localModuleRegistry = new LocalModuleRegistry();

    const remoteModuleRegistry = new RemoteModuleRegistry(jest.fn().mockResolvedValue({
        register: () => {}
    }));

    await localModuleRegistry.registerModules([
        () => {},
        () => {},
        () => {}
    ], runtime);

    await remoteModuleRegistry.registerModules([
        { name: "Dummy-1" },
        { name: "Dummy-2" },
        { name: "Dummy-3" }
    ], runtime);

    expect(areModulesRegistered(localModuleRegistry.registrationStatus, remoteModuleRegistry.registrationStatus)).toBeTruthy();
});

test("when only local module deferred registrations are registered, return true", async () => {
    const localModuleRegistry = new LocalModuleRegistry();

    const remoteModuleRegistry = new RemoteModuleRegistry(jest.fn().mockResolvedValue({
        register: () => {}
    }));

    await localModuleRegistry.registerModules([
        () => () => {},
        () => () => {},
        () => () => {}
    ], runtime);

    expect(areModulesRegistered(localModuleRegistry.registrationStatus, remoteModuleRegistry.registrationStatus)).toBeTruthy();
});

test("when only remote module deferred registrations are registered, return true", async () => {
    const localModuleRegistry = new LocalModuleRegistry();

    const remoteModuleRegistry = new RemoteModuleRegistry(jest.fn().mockResolvedValue({
        register: () => () => {}
    }));

    await remoteModuleRegistry.registerModules([
        { name: "Dummy-1" },
        { name: "Dummy-2" },
        { name: "Dummy-3" }
    ], runtime);

    expect(areModulesRegistered(localModuleRegistry.registrationStatus, remoteModuleRegistry.registrationStatus)).toBeTruthy();
});

test("when local module deferred registrations and remote module deferred registrations are registered, return true", async () => {
    const localModuleRegistry = new LocalModuleRegistry();

    const remoteModuleRegistry = new RemoteModuleRegistry(jest.fn().mockResolvedValue({
        register: () => () => {}
    }));

    await localModuleRegistry.registerModules([
        () => () => {},
        () => () => {},
        () => () => {}
    ], runtime);

    await remoteModuleRegistry.registerModules([
        { name: "Dummy-1" },
        { name: "Dummy-2" },
        { name: "Dummy-3" }
    ], runtime);

    expect(areModulesRegistered(localModuleRegistry.registrationStatus, remoteModuleRegistry.registrationStatus)).toBeTruthy();
});

test("when local module deferred registrations and remote modules are registered, return true", async () => {
    const localModuleRegistry = new LocalModuleRegistry();

    const remoteModuleRegistry = new RemoteModuleRegistry(jest.fn().mockResolvedValue({
        register: () => {}
    }));

    await localModuleRegistry.registerModules([
        () => () => {},
        () => () => {},
        () => () => {}
    ], runtime);

    await remoteModuleRegistry.registerModules([
        { name: "Dummy-1" },
        { name: "Dummy-2" },
        { name: "Dummy-3" }
    ], runtime);

    expect(areModulesRegistered(localModuleRegistry.registrationStatus, remoteModuleRegistry.registrationStatus)).toBeTruthy();
});

test("when local modules and remote module deferred registrations are registered, return true", async () => {
    const localModuleRegistry = new LocalModuleRegistry();

    const remoteModuleRegistry = new RemoteModuleRegistry(jest.fn().mockResolvedValue({
        register: () => () => {}
    }));

    await localModuleRegistry.registerModules([
        () => {},
        () => {},
        () => {}
    ], runtime);

    await remoteModuleRegistry.registerModules([
        { name: "Dummy-1" },
        { name: "Dummy-2" },
        { name: "Dummy-3" }
    ], runtime);

    expect(areModulesRegistered(localModuleRegistry.registrationStatus, remoteModuleRegistry.registrationStatus)).toBeTruthy();
});


