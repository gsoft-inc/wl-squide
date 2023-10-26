// The areModulesReady function is tested instead of the useAreModulesReady hook because it requires less mocking and
// kind of provide the same coverage as the only important logic to test for that hook is the check to validate whether
// or not the module registrations is considered as ready or not.

import { AbstractRuntime, LocalModuleRegistry } from "@squide/core";
import { RemoteModuleRegistry } from "../src/registerRemoteModules.ts";
import { areModulesReady } from "../src/useAreModulesReady.ts";

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

test("when no modules are registered, return false", async () => {
    const localModuleRegistry = new LocalModuleRegistry();

    const remoteModuleRegistry = new RemoteModuleRegistry(jest.fn().mockResolvedValue({
        register: () => {}
    }));

    expect(areModulesReady(localModuleRegistry.registrationStatus, remoteModuleRegistry.registrationStatus)).toBeFalsy();
});

test("when only local modules are registered and they are ready, return true", async () => {
    const localModuleRegistry = new LocalModuleRegistry();

    const remoteModuleRegistry = new RemoteModuleRegistry(jest.fn().mockResolvedValue({
        register: () => {}
    }));

    await localModuleRegistry.registerModules([
        () => {},
        () => {},
        () => {}
    ], runtime);

    await localModuleRegistry.completeModuleRegistrations(runtime);

    expect(areModulesReady(localModuleRegistry.registrationStatus, remoteModuleRegistry.registrationStatus)).toBeTruthy();
});

test("when only remote modules are registered and they are ready, return true", async () => {
    const localModuleRegistry = new LocalModuleRegistry();

    const remoteModuleRegistry = new RemoteModuleRegistry(jest.fn().mockResolvedValue({
        register: () => {}
    }));

    await remoteModuleRegistry.registerModules([
        { name: "Dummy-1", url: "http://anything1.com" },
        { name: "Dummy-2", url: "http://anything2.com" },
        { name: "Dummy-3", url: "http://anything3.com" }
    ], runtime);

    await remoteModuleRegistry.completeModuleRegistrations(runtime);

    expect(areModulesReady(localModuleRegistry.registrationStatus, remoteModuleRegistry.registrationStatus)).toBeTruthy();
});

test("when only local module deferred registrations are registered and they are ready, return true", async () => {
    const localModuleRegistry = new LocalModuleRegistry();

    const remoteModuleRegistry = new RemoteModuleRegistry(jest.fn().mockResolvedValue({
        register: () => {}
    }));

    await localModuleRegistry.registerModules([
        () => () => {},
        () => () => {},
        () => () => {}
    ], runtime);

    await localModuleRegistry.completeModuleRegistrations(runtime);

    expect(areModulesReady(localModuleRegistry.registrationStatus, remoteModuleRegistry.registrationStatus)).toBeTruthy();
});

test("when only remote module deferred registrations are registered and they are ready, return true", async () => {
    const localModuleRegistry = new LocalModuleRegistry();

    const remoteModuleRegistry = new RemoteModuleRegistry(jest.fn().mockResolvedValue({
        register: () => () => {}
    }));

    await remoteModuleRegistry.registerModules([
        { name: "Dummy-1", url: "http://anything1.com" },
        { name: "Dummy-2", url: "http://anything2.com" },
        { name: "Dummy-3", url: "http://anything3.com" }
    ], runtime);


    await remoteModuleRegistry.completeModuleRegistrations(runtime);

    expect(areModulesReady(localModuleRegistry.registrationStatus, remoteModuleRegistry.registrationStatus)).toBeTruthy();
});

test("when local module deferred registrations and remote module deferred registrations are registered and they are ready, return", async () => {
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
        { name: "Dummy-1", url: "http://anything1.com" },
        { name: "Dummy-2", url: "http://anything2.com" },
        { name: "Dummy-3", url: "http://anything3.com" }
    ], runtime);

    await localModuleRegistry.completeModuleRegistrations(runtime);
    await remoteModuleRegistry.completeModuleRegistrations(runtime);

    expect(areModulesReady(localModuleRegistry.registrationStatus, remoteModuleRegistry.registrationStatus)).toBeTruthy();
});

test("when local module deferred registrations and remote modules are registered and they are ready, return true", async () => {
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
        { name: "Dummy-1", url: "http://anything1.com" },
        { name: "Dummy-2", url: "http://anything2.com" },
        { name: "Dummy-3", url: "http://anything3.com" }
    ], runtime);

    await localModuleRegistry.completeModuleRegistrations(runtime);
    await remoteModuleRegistry.completeModuleRegistrations(runtime);

    expect(areModulesReady(localModuleRegistry.registrationStatus, remoteModuleRegistry.registrationStatus)).toBeTruthy();
});

test("when local modules and remote module deferred registrations are registered and they are ready, return true", async () => {
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
        { name: "Dummy-1", url: "http://anything1.com" },
        { name: "Dummy-2", url: "http://anything2.com" },
        { name: "Dummy-3", url: "http://anything3.com" }
    ], runtime);

    await localModuleRegistry.completeModuleRegistrations(runtime);
    await remoteModuleRegistry.completeModuleRegistrations(runtime);

    expect(areModulesReady(localModuleRegistry.registrationStatus, remoteModuleRegistry.registrationStatus)).toBeTruthy();
});

test("when only local module deferred registrations are registered and they are not completed, return false", async () => {
    const localModuleRegistry = new LocalModuleRegistry();

    const remoteModuleRegistry = new RemoteModuleRegistry(jest.fn().mockResolvedValue({
        register: () => {}
    }));

    await localModuleRegistry.registerModules([
        () => () => {},
        () => () => {},
        () => () => {}
    ], runtime);

    expect(areModulesReady(localModuleRegistry.registrationStatus, remoteModuleRegistry.registrationStatus)).toBeFalsy();
});

test("when only remote module deferred registrations are registered and they are not completed, return false", async () => {
    const localModuleRegistry = new LocalModuleRegistry();

    const remoteModuleRegistry = new RemoteModuleRegistry(jest.fn().mockResolvedValue({
        register: () => () => {}
    }));

    await remoteModuleRegistry.registerModules([
        { name: "Dummy-1", url: "http://anything1.com" },
        { name: "Dummy-2", url: "http://anything2.com" },
        { name: "Dummy-3", url: "http://anything3.com" }
    ], runtime);

    expect(areModulesReady(localModuleRegistry.registrationStatus, remoteModuleRegistry.registrationStatus)).toBeFalsy();
});

test("when local module deferred registrations and remote module deferred registrations are registered and they are not completed, return false", async () => {
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
        { name: "Dummy-1", url: "http://anything1.com" },
        { name: "Dummy-2", url: "http://anything2.com" },
        { name: "Dummy-3", url: "http://anything3.com" }
    ], runtime);

    expect(areModulesReady(localModuleRegistry.registrationStatus, remoteModuleRegistry.registrationStatus)).toBeFalsy();
});

test("when local module deferred registrations and remote module deferred registrations are registered and only the local module deferred registrations are completed, return false", async () => {
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
        { name: "Dummy-1", url: "http://anything1.com" },
        { name: "Dummy-2", url: "http://anything2.com" },
        { name: "Dummy-3", url: "http://anything3.com" }
    ], runtime);

    await localModuleRegistry.completeModuleRegistrations(runtime);

    expect(areModulesReady(localModuleRegistry.registrationStatus, remoteModuleRegistry.registrationStatus)).toBeFalsy();
});

test("when local module deferred registrations and remote module deferred registrations are registered and only the remote module deferred registrations are completed, return false", async () => {
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
        { name: "Dummy-1", url: "http://anything1.com" },
        { name: "Dummy-2", url: "http://anything2.com" },
        { name: "Dummy-3", url: "http://anything3.com" }
    ], runtime);

    await remoteModuleRegistry.completeModuleRegistrations(runtime);

    expect(areModulesReady(localModuleRegistry.registrationStatus, remoteModuleRegistry.registrationStatus)).toBeFalsy();
});
