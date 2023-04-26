import { defineConfig } from "tsup";

export default defineConfig({
    clean: true,
    watch: true,
    dts: true,
    sourcemap: "inline",
    entry: ["./src/index.ts"],
    outDir: "./dist",
    format: ["esm"],
    platform: "browser"
});
