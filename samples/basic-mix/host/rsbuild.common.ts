import type { ModuleFederationShared } from "@squide/firefly-rsbuild-configs";

export function getSharedDependencies() {
    return {
        "@basic/shared": {
            singleton: true,
            eager: true
        },
        "useless-lib": {
            singleton: true,
            eager: true
        }
    } satisfies ModuleFederationShared;
}
