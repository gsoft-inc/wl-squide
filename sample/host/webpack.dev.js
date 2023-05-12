// @ts-check

// Added for TSC, otherwise the "devServer" section is unknown.
import "webpack-dev-server";

import HtmlWebpackPlugin from "html-webpack-plugin";
import { hostTransformer } from "@squide/webpack-module-federation/configTransformer.js";

// import { fileURLToPath } from "url";
// import path from "path";

/** @type {import("webpack").Configuration} */
const config = {
    mode: "development",
    target: "web",
    devtool: "eval-cheap-module-source-map",
    devServer: {
        port: 8080,
        historyApiFallback: true
    },
    entry: "./src/index.ts",
    output: {
        // The trailing / is very important, otherwise paths will ne be resolved correctly.
        publicPath: "http://localhost:8080/"
    },
    // cache: {
    //     type: "filesystem",
    //     allowCollectingMemory: true,
    //     buildDependencies: {
    //         config: [fileURLToPath(import.meta.url)]
    //     },
    //     cacheDirectory: path.resolve("node_modules/.cache/webpack")
    // },
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: "swc-loader"
                }
            },
            {
                // https://stackoverflow.com/questions/69427025/programmatic-webpack-jest-esm-cant-resolve-module-without-js-file-exten
                test: /\.js/,
                resolve: {
                    fullySpecified: false
                }
            },
            {
                test: /\.(png|jpe?g|gif)$/i,
                type: "asset/resource"
            }
        ]
    },
    resolve: {
        // Must add ".js" for files imported from node_modules.
        extensions: [".js", ".ts", ".tsx"]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "./public/index.html"
        })
    ]
};

const federatedConfig = hostTransformer(config, "host", {
    pluginOptions: {
        shared: {
            "shared": {
                singleton: true
            }
        }
    }
});

export default federatedConfig;
