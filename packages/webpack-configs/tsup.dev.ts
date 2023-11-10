import { defineDevConfig } from "@workleap/tsup-configs";

export default defineDevConfig({
    // Temporary fix to support using "node:path".
    platform: undefined,
    entry: ["./src/index.ts"]
});
