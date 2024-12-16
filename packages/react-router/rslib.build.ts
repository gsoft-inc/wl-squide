import { pluginReact } from "@rsbuild/plugin-react";
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
        target: "web",
        distPath: {
            root: "./dist"
        },
        cleanDistPath: true,
        minify: false
    },
    plugins: [pluginReact()]
});
