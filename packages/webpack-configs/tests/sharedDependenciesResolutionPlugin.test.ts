import type { FederationHost } from "@module-federation/enhanced/runtime";
import { resolveDependencyVersion } from "../src/sharedDependenciesResolutionPlugin.ts";

type Shared = FederationHost["shareScopeMap"][string][string][string];

function createSharedVersion(from: string, version: string, singleton?: boolean): Shared {
    return {
        from,
        version,
        shareConfig: {
            singleton,
            requiredVersion: false
        },
        deps: [],
        get: () => () => {},
        scope: ["default"],
        strategy: "version-first",
        useIn: [from]
    };
}

test("when a remote request a version with the same major version as the host requested version, but with an higher minor version, resolve to the remote requested version", () => {
    const result = resolveDependencyVersion("my-lib", [
        createSharedVersion("host", "2.0.0", true),
        createSharedVersion("remote-1", "2.1.0", true),
        createSharedVersion("remote-2", "2.0.0", true)
    ]);

    expect(result.version).toBe("2.1.0");
});

test("when a remote request a version with the same major version as the host requested version, but with an higher patch version, resolve to the remote requested version", () => {
    const result = resolveDependencyVersion("my-lib", [
        createSharedVersion("host", "2.0.0", true),
        createSharedVersion("remote-1", "3.1.0", true),
        createSharedVersion("remote-2", "2.0.0", true)
    ]);

    expect(result.version).toBe("2.0.0");
});

test("when a remote request a version with an higher major version than the host requested version, fallback to the highest requested version sharing the same major version as the host requested version", () => {
    const result = resolveDependencyVersion("my-lib", [
        createSharedVersion("host", "2.0.0", true),
        createSharedVersion("remote-1", "3.1.0", true),
        createSharedVersion("remote-2", "2.1.0", true)
    ]);

    expect(result.version).toBe("2.1.0");
});

test("supports \">\" range", () => {
    const result = resolveDependencyVersion("my-lib", [
        createSharedVersion("host", ">2.0.0", true),
        createSharedVersion("remote-1", "3.1.0", true),
        createSharedVersion("remote-2", "2.1.0", true)
    ]);

    expect(result.version).toBe("2.1.0");
});

test("supports \">=\" range", () => {
    const result = resolveDependencyVersion("my-lib", [
        createSharedVersion("host", ">=2.0.0", true),
        createSharedVersion("remote-1", "3.1.0", true),
        createSharedVersion("remote-2", "2.1.0", true)
    ]);

    expect(result.version).toBe("2.1.0");
});

test("supports \"> <\" range", () => {
    const result = resolveDependencyVersion("my-lib", [
        createSharedVersion("host", ">2.0.0 <2.1.0", true),
        createSharedVersion("remote-1", "3.1.0", true),
        createSharedVersion("remote-2", "2.1.0", true)
    ]);

    expect(result.version).toBe("2.1.0");
});

test("supports \"> <=\" range", () => {
    const result = resolveDependencyVersion("my-lib", [
        createSharedVersion("host", ">2.0.0 <=2.1.0", true),
        createSharedVersion("remote-1", "3.1.0", true),
        createSharedVersion("remote-2", "2.1.0", true)
    ]);

    expect(result.version).toBe("2.1.0");
});

test("supports \"^\" range", () => {
    const result = resolveDependencyVersion("my-lib", [
        createSharedVersion("host", "^2.0.0", true),
        createSharedVersion("remote-1", "3.1.0", true),
        createSharedVersion("remote-2", "2.1.0", true)
    ]);

    expect(result.version).toBe("2.1.0");
});
