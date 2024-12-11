import type { ModuleFederationShared } from "@squide/firefly-rsbuild-configs";

export function getSharedDependencies(isHost: boolean) {
    return {
        "@basic/shared": {
            singleton: true,
            eager: isHost ? true : undefined
        },
        "useless-lib": {
            singleton: true,
            eager: isHost ? true : undefined
        }
    } satisfies ModuleFederationShared;
}
