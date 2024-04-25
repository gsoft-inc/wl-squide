import { defineDevConfig } from "@workleap/tsup-configs";

export default defineDevConfig({
    // Temporary fix to support using "node:path".
    platform: undefined,
    // treeshake: true,
    entry: [
        "./src/index.ts",
        "./src/sharedDependenciesResolutionPlugin.ts",
        "./src/nonCacheableRemoteEntryPlugin.ts"
    ]
});
