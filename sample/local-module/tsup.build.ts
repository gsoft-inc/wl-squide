import { defineConfig } from "tsup";

export default defineConfig({
    clean: true,
    treeshake: true,
    dts: {
        compilerOptions: {
            noUnusedLocals: false
        }
    },
    minify: true,
    entry: ["./src"],
    outDir: "./dist",
    format: ["esm"],
    target: "esnext",
    platform: "browser"
});
