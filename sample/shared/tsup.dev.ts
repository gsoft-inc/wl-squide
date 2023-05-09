import { defineConfig } from "tsup";

export default defineConfig({
    watch: true,
    dts: {
        compilerOptions: {
            noUnusedLocals: false
        }
    },
    sourcemap: "inline",
    entry: ["./src"],
    outDir: "./dist",
    format: ["esm"],
    target: "esnext",
    platform: "browser"
});
