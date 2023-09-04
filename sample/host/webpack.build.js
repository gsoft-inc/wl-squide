// // @ts-check

// import { hostTransformer } from "@squide/webpack-module-federation/configTransformer.js";
// import HtmlWebpackPlugin from "html-webpack-plugin";
// import path from "path";
// import TerserPlugin from "terser-webpack-plugin";
// import webpack from "webpack";
// import { swcConfig } from "./swc.build.js";

// const DefinePlugin = webpack.DefinePlugin;

// /** @type {import("webpack").Configuration} */
// const config = {
//     mode: "production",
//     target: "web",
//     entry: "./src/index.ts",
//     output: {
//         path: path.resolve("dist"),
//         // The trailing / is very important, otherwise paths will ne be resolved correctly.
//         publicPath: "https://squide-host.netlify.app/",
//         clean: true
//     },
//     optimization: {
//         minimize: true,
//         minimizer: [
//             // Allow us to use SWC for package optimization, which is way faster than the default minimizer
//             new TerserPlugin({
//                 minify: TerserPlugin.swcMinify,
//                 // `terserOptions` options will be passed to `swc` (`@swc/core`)
//                 // Link to options - https://swc.rs/docs/config-js-minify
//                 terserOptions: {
//                     compress: true,
//                     mangle: true
//                 }
//             })
//         ]
//     },
//     module: {
//         rules: [
//             {
//                 test: /\.(ts|tsx)$/,
//                 exclude: /node_modules/,
//                 use: {
//                     loader: "swc-loader",
//                     options: swcConfig
//                 }
//             },
//             {
//                 // https://stackoverflow.com/questions/69427025/programmatic-webpack-jest-esm-cant-resolve-module-without-js-file-exten
//                 test: /\.js/,
//                 resolve: {
//                     fullySpecified: false
//                 }
//             },
//             {
//                 test: /\.(png|jpe?g|gif)$/i,
//                 type: "asset/resource"
//             }
//         ]
//     },
//     resolve: {
//         // Must add ".js" for files imported from node_modules.
//         extensions: [".js", ".ts", ".tsx"]
//     },
//     plugins: [
//         new HtmlWebpackPlugin({
//             template: "./public/index.html"
//         }),
//         new DefinePlugin({
//             "process.env": JSON.stringify(process.env)
//         })
//     ]
// };

// const federatedConfig = hostTransformer(config, "host", {
//     pluginOptions: {
//         shared: {
//             "shared": {
//                 singleton: true
//             }
//         }
//     }
// });

// export default federatedConfig;

// @ts-check

import { isNetlify } from "@sample/shared";
import { createHostTransformer } from "@squide/webpack-module-federation/configTransformer.js";
import { defineBuildConfig } from "@workleap/webpack-configs";
import { swcConfig } from "./swc.build.js";

export default defineBuildConfig(swcConfig, {
    entry: "./src/index.ts",
    // The trailing / is very important, otherwise paths will ne be resolved correctly.
    publicPath: isNetlify ? "https://squide-host.netlify.app/" : "http://locahost:8080/",
    environmentVariables: {
        "NETLIFY": isNetlify.toString()
    },
    transformers: [createHostTransformer("host", {
        pluginOptions: {
            shared: {
                "shared": {
                    singleton: true
                }
            }
        }
    })]
});

