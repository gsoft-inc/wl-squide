import { defineConfig } from "@rslib/core";

export default defineConfig({
    lib: [{
        format: "esm",
        syntax: "esnext",
        bundle: false,
        dts: true
    }],
    source: {
        entry: {
            index: "./src/**"
        },
        tsconfigPath: "./tsconfig.build.json"
    },
    output: {
        target: "node",
        distPath: {
            root: "./dist"
        },
        cleanDistPath: true,
        minify: false
    }
});
