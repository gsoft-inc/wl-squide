import { defineConfig, type HtmlConfig, type Polyfill, type RsbuildConfig, type RsbuildEntry, type RsbuildPlugins, type ServerConfig, type SourceMap } from "@rsbuild/core";
import { pluginBasicSsl } from "@rsbuild/plugin-basic-ssl";
import { pluginReact, type PluginReactOptions } from "@rsbuild/plugin-react";
import { pluginSvgr, type PluginSvgrOptions } from "@rsbuild/plugin-svgr";
import path from "node:path";
import { applyTransformers, type RsbuildConfigTransformer } from "./applyTransformers.ts";

export type DefineDevHtmlPluginConfigFunction = (defaultOptions: HtmlConfig) => HtmlConfig;
export type DefineDevDefineReactPluginConfigFunction = (defaultOptions: PluginReactOptions) => PluginReactOptions;
export type DefineDevSvgrPluginConfigFunction = (defaultOptions: PluginSvgrOptions) => PluginSvgrOptions;

export interface DefineDevConfigOptions {
    entry?: RsbuildEntry;
    https?: boolean | ServerConfig["https"];
    host?: string;
    port?: number;
    // Similar to webpack.publicPath.
    assetPrefix?: `${string}/` | "auto";
    plugins?: RsbuildPlugins;
    html?: false | DefineDevHtmlPluginConfigFunction;
    lazyCompilation?: boolean;
    hmr?: boolean;
    fastRefresh?: boolean;
    sourceMap?: boolean | SourceMap;
    polyfill?: Polyfill;
    overlay?: false;
    react?: false | DefineDevDefineReactPluginConfigFunction;
    svgr? : false | DefineDevSvgrPluginConfigFunction;
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

export function defineDevConfig(options: DefineDevConfigOptions = {}) {
    const {
        entry = {
            index: path.resolve("./src/index.tsx")
        },
        https = false,
        host = "localhost",
        port = 8080,
        assetPrefix,
        plugins = [],
        html = defaultDefineHtmlPluginConfig,
        lazyCompilation = true,
        hmr = true,
        fastRefresh = true,
        sourceMap = {
            js: "cheap-module-source-map",
            css: true
        },
        polyfill = "entry",
        overlay,
        react = defaultDefineReactPluginConfig,
        svgr = defineSvgrPluginConfig,
        // Using an empty object literal as the default value to ensure
        // "process.env" is always available.
        environmentVariables = {},
        transformers = [],
        verbose = false
    } = options;

    const config: RsbuildConfig = {
        mode: "development",
        dev: {
            lazyCompilation,
            hmr,
            client: (overlay === false || fastRefresh) ? {
                overlay: false
            } : undefined
        },
        server: {
            https: typeof https === "boolean" ? undefined : https,
            host,
            port,
            historyApiFallback: true
        },
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
            // The trailing / is very important, otherwise paths will not be resolved correctly.
            assetPrefix: assetPrefix ?? `${https ? "https" : "http"}://${host}:${port}/`,
            minify: false,
            sourceMap,
            polyfill
        },
        html: html
            ? html({ template: path.resolve("./public/index.html") })
            : undefined,
        plugins: [
            typeof https === "boolean" && https && pluginBasicSsl(),
            react && pluginReact(react({
                fastRefresh,
                reactRefreshOptions: {
                    overlay: overlay !== false
                }
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
                infrastructureLogging: verbose ? {
                    appendOnly: true,
                    level: "verbose",
                    debug: /PackFileCache/
                } : undefined
            }
        }
    };

    const transformedConfig = applyTransformers(config, transformers, {
        environment: "dev",
        verbose
    });

    return defineConfig(transformedConfig);
}

