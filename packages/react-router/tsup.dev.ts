import { defineConfig } from "tsup";

export default defineConfig({
    clean: true,
    watch: true,
    dts: true,
    sourcemap: "inline",
    entry: ["./src"],
    outDir: "./dist",
    format: ["esm"],
    target: "esnext",
    platform: "browser"
});
