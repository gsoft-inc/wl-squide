import { defineBuildConfig } from "@workleap/tsup-configs";

export default defineBuildConfig({
    // Temporary fix to support using "node:path".
    platform: undefined,
    entry: ["./src/index.ts", "./src/defineConfig.ts"]
});
