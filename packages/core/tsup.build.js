import { defineConfig } from "tsup";

export default defineConfig({
    clean: true,
    treeshake: true,
    dts: true,
    minify: "terser",
    entry: ["./src/index.ts"],
    outDir: "./dist",
    format: ["esm"],
    platform: "browser"
});
