import { defineConfig } from "tsup";

export default defineConfig({
    clean: true,
    treeshake: true,
    dts: true,
    minify: true,
    entry: ["./src"],
    outDir: "./dist",
    format: ["esm"],
    target: "esnext",
    platform: "browser"
});
