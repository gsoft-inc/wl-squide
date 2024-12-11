import { defineConfig, type DistPathConfig, type HtmlConfig, type Minify, type RsbuildConfig, type RsbuildEntry, type RsbuildPlugins, type SourceMap } from "@rsbuild/core";
import { pluginReact, type PluginReactOptions } from "@rsbuild/plugin-react";
import { pluginSvgr, type PluginSvgrOptions } from "@rsbuild/plugin-svgr";
import { SwcJsMinimizerRspackPlugin, type Optimization } from "@rspack/core";
import path from "node:path";
import { applyTransformers, type RsbuildConfigTransformer } from "./applyTransformers.ts";

export type OptimizeOption = boolean | "readable";

export type DefineBuildHtmlPluginConfigFunction = (defaultOptions: HtmlConfig) => HtmlConfig;
export type DefineBuildDefineReactPluginConfigFunction = (defaultOptions: PluginReactOptions) => PluginReactOptions;
export type DefineBuildSvgrPluginConfigFunction = (defaultOptions: PluginSvgrOptions) => PluginSvgrOptions;

export interface DefineBuildConfigOptions {
    entry?: RsbuildEntry;
    // Similar to webpack.output.path.
    distPath?: DistPathConfig;
    // Similar to webpack.publicPath.
    assetPrefix?: `${string}/` | "auto";
    plugins?: RsbuildPlugins;
    html?: false | DefineBuildHtmlPluginConfigFunction;
    minify?: Minify;
    sourceMap?: boolean | SourceMap;
    optimize?: OptimizeOption;
    react?: false | DefineBuildDefineReactPluginConfigFunction;
    svgr? : false | DefineBuildSvgrPluginConfigFunction;
    environmentVariables?: Record<string, unknown>;
    transformers?: RsbuildConfigTransformer[];
    verbose?: boolean;
}

function defaultDefineHtmlPluginConfig(options: HtmlConfig) {
    return options;
}

function defaultDefineReactPluginConfig(options: PluginReactOptions) {
    return options;
}

function defineSvgrPluginConfig(options: PluginSvgrOptions) {
    return options;
}

export function getOptimizationConfig(optimize: OptimizeOption): Optimization {
    if (optimize === "readable") {
        return {
            minimize: true,
            minimizer: [
                new SwcJsMinimizerRspackPlugin({
                    minimizerOptions: {
                        mangle: false,
                        compress: {
                            toplevel: true,
                            hoist_props: false
                        }
                    }
                })
            ],
            chunkIds: "named",
            moduleIds: "named",
            mangleExports: false
        };
    } else if (optimize) {
        return {
            minimize: true
        };
    }

    // Doesn't turnoff everything but is good enough to help with debugging scenarios.
    return {
        minimize: false,
        chunkIds: "named",
        moduleIds: "named",
        concatenateModules: false,
        mangleExports: false,
        removeAvailableModules: false,
        usedExports: false
    };
}

export function defineBuildConfig(options: DefineBuildConfigOptions = {}) {
    const {
        entry = {
            index: path.resolve("./src/index.tsx")
        },
        distPath = {
            root: path.resolve("./dist")
        },
        // The trailing / is very important, otherwise paths will not be resolved correctly.
        assetPrefix = "http://localhost:8080/",
        plugins = [],
        html = defaultDefineHtmlPluginConfig,
        minify = true,
        sourceMap = {
            js: "source-map",
            css: true
        },
        react = defaultDefineReactPluginConfig,
        optimize = true,
        svgr = defineSvgrPluginConfig,
        // Using an empty object literal as the default value to ensure
        // "process.env" is always available.
        environmentVariables = {},
        transformers = [],
        verbose = false
    } = options;

    const config: RsbuildConfig = {
        mode: "production",
        source: {
            entry,
            // Stringify the environment variables because the plugin does a direct text replacement. Otherwise, "production" would become production
            // after replacement and cause an undefined var error because the production var doesn't exist.
            // For more information, view: https://rsbuild.dev/guide/advanced/env-vars#using-define.
            define: {
                "process.env": Object.keys(environmentVariables).reduce((acc, key) => {
                    acc[key] = JSON.stringify(environmentVariables[key]);

                    return acc;
                }, {} as Record<string, string>)
            }
        },
        output: {
            target: "web",
            distPath,
            cleanDistPath: true,
            assetPrefix,
            filename: {
                html: "[name].html",
                js: "[name].js",
                css: "[name].css",
                svg: "[name].[contenthash:8].svg",
                font: "[name].[contenthash:8][ext]",
                image: "[name].[contenthash:8][ext]",
                media: "[name].[contenthash:8][ext]",
                assets: "[name].[contenthash:8][ext]"
            },
            minify,
            sourceMap
        },
        html: html
            ? html({ template: path.resolve("./public/index.html") })
            : undefined,
        plugins: [
            react && pluginReact(react({
                fastRefresh: false
            })),
            svgr && pluginSvgr(svgr({
                svgrOptions: {
                    exportType: "named"
                }
            })),
            ...plugins
        ].filter(Boolean),
        tools: {
            rspack: {
                optimization: getOptimizationConfig(optimize),
                infrastructureLogging: verbose ? {
                    appendOnly: true,
                    level: "verbose",
                    debug: /PackFileCache/
                } : undefined
            }
        }
    };

    const transformedConfig = applyTransformers(config, transformers, {
        environment: "build",
        verbose
    });

    return defineConfig(transformedConfig);
}
