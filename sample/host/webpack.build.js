// @ts-check

import HtmlWebpackPlugin from "html-webpack-plugin";
import TerserPlugin from "terser-webpack-plugin";
import { hostTransformer } from "@squide/webpack-module-federation/configTransformer.js";
import path from "path";
import webpack from "webpack";

const DefinePlugin = webpack.DefinePlugin;

/** @type {import("webpack").Configuration} */
const config = {
    mode: "production",
    target: "web",
    entry: "./src/index.ts",
    output: {
        path: path.resolve("dist"),
        // The trailing / is very important, otherwise paths will ne be resolved correctly.
        publicPath: "https://squide-host.netlify.app/",
        clean: true
    },
    optimization: {
        minimize: true,
        minimizer: [
            // Allow us to use SWC for package optimization, which is way faster than the default minimizer
            new TerserPlugin({
                minify: TerserPlugin.swcMinify,
                // `terserOptions` options will be passed to `swc` (`@swc/core`)
                // Link to options - https://swc.rs/docs/config-js-minify
                terserOptions: {
                    compress: true,
                    mangle: true
                }
            })
        ]
    },
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
        }),
        new DefinePlugin({
            "process.env": JSON.stringify(process.env)
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
