import type { SwcConfig } from "@workleap/swc-configs";
import { defineBuildConfig, defineBuildHtmlWebpackPluginConfig, defineDevConfig, defineDevHtmlWebpackPluginConfig, type DefineBuildConfigOptions, type DefineDevConfigOptions, type WebpackConfig, type WebpackConfigTransformer } from "@workleap/webpack-configs";
import merge from "deepmerge";
import type HtmlWebpackPlugin from "html-webpack-plugin";
import path from "node:path";
import webpack from "webpack";
import { RemoteEntryPoint, RemoteModuleName } from "./remoteDefinition.ts";

// Webpack doesn't export ModuleFederationPlugin typings.
export type ModuleFederationPluginOptions = ConstructorParameters<typeof webpack.container.ModuleFederationPlugin>[0];

// Generally, only the host application should have eager dependencies.
// For more informations about shared dependencies refer to: https://github.com/patricklafrance/wmf-versioning
function getDefaultSharedDependencies(isHost: boolean) {
    return {
        "react": {
            singleton: true,
            eager: isHost ? true : undefined
        },
        "react-dom": {
            singleton: true,
            eager: isHost ? true : undefined
        },
        "@squide/core": {
            singleton: true,
            eager: isHost ? true : undefined
        },
        "@squide/webpack-module-federation": {
            singleton: true,
            eager: isHost ? true : undefined
        }
    };
}

export type Router = "react-router";

export interface Features {
    router?: Router;
    msw?: boolean;
}

// Generally, only the host application should have eager dependencies.
// For more informations about shared dependencies refer to: https://github.com/patricklafrance/wmf-versioning
function getReactRouterSharedDependencies(isHost: boolean) {
    return {
        "react-router-dom": {
            singleton: true,
            eager: isHost ? true : undefined
        },
        "@squide/react-router": {
            singleton: true,
            eager: isHost ? true : undefined
        }
    };
}

function getMswSharedDependency(isHost: boolean) {
    return {
        "@squide/msw": {
            singleton: true,
            eager: isHost ? true : undefined
        }
    };
}

function getFeaturesDependencies({ router = "react-router", msw }: Features, isHost: boolean) {
    return {
        ...(router === "react-router" ? getReactRouterSharedDependencies(isHost) : {}),
        ...(msw ? getMswSharedDependency(isHost) : {})
    };
}

function resolveDefaultSharedDependencies(features: Features, isHost: boolean) {
    return {
        ...getDefaultSharedDependencies(isHost),
        ...getFeaturesDependencies(features, isHost)
    };
}

const forceNamedChunkIdsTransformer: WebpackConfigTransformer = (config: WebpackConfig) => {
    config.optimization = {
        ...(config.optimization ?? {}),
        // Without named chunk ids, there are some Webpack features that do not work
        // when used with Module Federation. One of these feature is using a dynamic import in
        // a remote module.
        chunkIds: "named"
    };

    return config;
};

////////////////////////////  Host  /////////////////////////////

export interface DefineHostModuleFederationPluginOptions extends ModuleFederationPluginOptions {
    features?: Features;
}

// The function return type is mandatory, otherwise we got an error TS4058.
export function defineHostModuleFederationPluginOptions(applicationName: string, options: DefineHostModuleFederationPluginOptions): ModuleFederationPluginOptions {
    const {
        features = {},
        shared = {},
        ...rest
    } = options;


    const defaultSharedDependencies = resolveDefaultSharedDependencies(features, true);

    return {
        name: applicationName,
        // Deep merging the default shared dependencies with the provided shared dependencies
        // to allow the consumer to easily override a default option of a shared dependency
        // without extending the whole default shared dependencies object.
        shared: merge.all([
            defaultSharedDependencies,
            shared
        ]) as ModuleFederationPluginOptions["shared"],
        ...rest
    };
}

// Fixing HMR and page reloads when using `publicPath: auto` either in the host or remotes webpack configuration.
// Otherwise, when a nested page that belongs to a remote module is reloaded, an "Unexpected token" error will be thrown.
function trySetHtmlWebpackPluginPublicPath(options: HtmlWebpackPlugin.Options) {
    if (!options.publicPath) {
        options.publicPath = "/";
    }

    return options;
}

export interface DefineDevHostConfigOptions extends Omit<DefineDevConfigOptions, "htmlWebpackPlugin" | "fastRefresh" | "port"> {
    htmlWebpackPluginOptions?: HtmlWebpackPlugin.Options;
    features?: Features;
    sharedDependencies?: ModuleFederationPluginOptions["shared"];
    moduleFederationPluginOptions?: ModuleFederationPluginOptions;
}

// The function return type is mandatory, otherwise we got an error TS4058.
export function defineDevHostConfig(swcConfig: SwcConfig, applicationName: string, port: number, options: DefineDevHostConfigOptions = {}): webpack.Configuration {
    const {
        entry = path.resolve("./src/index.ts"),
        publicPath = "auto",
        cache = false,
        plugins = [],
        htmlWebpackPluginOptions,
        features,
        sharedDependencies,
        moduleFederationPluginOptions = defineHostModuleFederationPluginOptions(applicationName, { features, shared: sharedDependencies }),
        ...webpackOptions
    } = options;

    return defineDevConfig(swcConfig, {
        entry,
        port,
        publicPath,
        cache,
        fastRefresh: false,
        htmlWebpackPlugin: trySetHtmlWebpackPluginPublicPath(htmlWebpackPluginOptions ?? defineBuildHtmlWebpackPluginConfig()),
        plugins: [
            ...plugins,
            new webpack.container.ModuleFederationPlugin(moduleFederationPluginOptions)
        ],
        ...webpackOptions
    });
}

export interface DefineBuildHostConfigOptions extends Omit<DefineBuildConfigOptions, "htmlWebpackPlugin"> {
    htmlWebpackPluginOptions?: HtmlWebpackPlugin.Options;
    features?: Features;
    sharedDependencies?: ModuleFederationPluginOptions["shared"];
    moduleFederationPluginOptions?: ModuleFederationPluginOptions;
}

// The function return type is mandatory, otherwise we got an error TS4058.
export function defineBuildHostConfig(swcConfig: SwcConfig, applicationName: string, options: DefineBuildHostConfigOptions = {}): webpack.Configuration {
    const {
        entry = path.resolve("./src/index.ts"),
        publicPath = "auto",
        cache = false,
        plugins = [],
        htmlWebpackPluginOptions,
        transformers = [],
        features,
        sharedDependencies,
        moduleFederationPluginOptions = defineHostModuleFederationPluginOptions(applicationName, { features, shared: sharedDependencies }),
        ...webpackOptions
    } = options;

    return defineBuildConfig(swcConfig, {
        entry,
        publicPath,
        cache,
        htmlWebpackPlugin: trySetHtmlWebpackPluginPublicPath(htmlWebpackPluginOptions ?? defineDevHtmlWebpackPluginConfig()),
        plugins: [
            ...plugins,
            new webpack.container.ModuleFederationPlugin(moduleFederationPluginOptions)
        ],
        transformers: [
            forceNamedChunkIdsTransformer,
            ...transformers
        ],
        ...webpackOptions
    });
}

////////////////////////////  Remote  /////////////////////////////

export interface DefineRemoteModuleFederationPluginOptions extends ModuleFederationPluginOptions {
    features?: Features;
}

// The function return type is mandatory, otherwise we got an error TS4058.
export function defineRemoteModuleFederationPluginOptions(applicationName: string, options: DefineRemoteModuleFederationPluginOptions): ModuleFederationPluginOptions {
    const {
        features = {},
        exposes = {},
        shared = {},
        ...rest
    } = options;

    const defaultSharedDependencies = resolveDefaultSharedDependencies(features, false);

    return {
        name: applicationName,
        filename: RemoteEntryPoint,
        exposes: {
            [RemoteModuleName]: "./src/register",
            ...exposes
        },
        // Deep merging the default shared dependencies with the provided shared dependencies
        // to allow the consumer to easily override a default option of a shared dependency
        // without extending the whole default shared dependencies object.
        shared: merge.all([
            defaultSharedDependencies,
            shared
        ]) as ModuleFederationPluginOptions["shared"],
        ...rest
    };
}

const devRemoteModuleTransformer: WebpackConfigTransformer = (config: WebpackConfig) => {
    // "config.devServer" does exist but webpack types are a messed. It could probably be solved by importing "webpack-dev-server"
    // but I would prefer not adding it as a project dependency.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    config.devServer.headers = {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        ...(config.devServer.headers ?? {}),
        // Otherwise hot reload in the host failed with a CORS error.
        "Access-Control-Allow-Origin": "*"
    };

    return config;
};

export interface DefineDevRemoteModuleConfigOptions extends Omit<DefineDevConfigOptions, "fastRefresh" | "port" | "overlay"> {
    features?: Features;
    sharedDependencies?: ModuleFederationPluginOptions["shared"];
    moduleFederationPluginOptions?: ModuleFederationPluginOptions;
}

// The function return type is mandatory, otherwise we got an error TS4058.
export function defineDevRemoteModuleConfig(swcConfig: SwcConfig, applicationName: string, port: number, options: DefineDevRemoteModuleConfigOptions = {}): webpack.Configuration {
    const {
        entry = path.resolve("./src/register.tsx"),
        publicPath = "auto",
        cache = false,
        plugins = [],
        htmlWebpackPlugin = false,
        transformers = [],
        features,
        sharedDependencies,
        moduleFederationPluginOptions = defineRemoteModuleFederationPluginOptions(applicationName, { features, shared: sharedDependencies }),
        ...webpackOptions
    } = options;

    return defineDevConfig(swcConfig, {
        entry,
        port,
        publicPath,
        cache,
        fastRefresh: false,
        htmlWebpackPlugin,
        // Disable the error overlay by default for remotes as otherwise every remote module's error overlay will be
        // stack on top of the host application's error overlay.
        overlay: false,
        plugins: [
            ...plugins,
            new webpack.container.ModuleFederationPlugin(moduleFederationPluginOptions)
        ],
        transformers: [
            devRemoteModuleTransformer,
            ...transformers
        ],
        ...webpackOptions
    });
}

export interface DefineBuildRemoteModuleConfigOptions extends DefineBuildConfigOptions {
    features?: Features;
    sharedDependencies?: ModuleFederationPluginOptions["shared"];
    moduleFederationPluginOptions?: ModuleFederationPluginOptions;
}

// The function return type is mandatory, otherwise we got an error TS4058.
export function defineBuildRemoteModuleConfig(swcConfig: SwcConfig, applicationName: string, options: DefineBuildRemoteModuleConfigOptions = {}): webpack.Configuration {
    const {
        entry = path.resolve("./src/register.tsx"),
        publicPath = "auto",
        cache = false,
        plugins = [],
        htmlWebpackPlugin = false,
        transformers = [],
        features,
        sharedDependencies,
        moduleFederationPluginOptions = defineRemoteModuleFederationPluginOptions(applicationName, { features, shared: sharedDependencies }),
        ...webpackOptions
    } = options;

    return defineBuildConfig(swcConfig, {
        entry,
        publicPath,
        cache,
        htmlWebpackPlugin,
        plugins: [
            ...plugins,
            new webpack.container.ModuleFederationPlugin(moduleFederationPluginOptions)
        ],
        transformers: [
            forceNamedChunkIdsTransformer,
            ...transformers
        ],
        ...webpackOptions
    });
}
