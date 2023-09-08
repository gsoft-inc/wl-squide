import type { SwcConfig } from "@workleap/swc-configs";
import { defineBuildConfig, defineDevConfig, type DefineBuildConfigOptions, type DefineDevConfigOptions, type WebpackConfig, type WebpackConfigTransformer } from "@workleap/webpack-configs";
import merge from "deepmerge";
import type HtmlWebpackPlugin from "html-webpack-plugin";
import path from "node:path";
import webpack from "webpack";
import { RemoteEntryPoint, RemoteModuleName } from "./remoteDefinition.ts";

// Webpack doesn't export ModuleFederationPlugin typings.
export type ModuleFederationPluginOptions = ConstructorParameters<typeof webpack.container.ModuleFederationPlugin>[0];

export const DefaultSharedDependencies = {
    "react": {
        singleton: true,
        eager: true
    },
    "react-dom": {
        singleton: true,
        eager: true
    },
    "@squide/core": {
        singleton: true,
        eager: true
    },
    "@squide/webpack-module-federation": {
        singleton: true,
        eager: true
    }
};

export const ReactRouterSharedDependencies = {
    "react-router-dom": {
        singleton: true,
        eager: true
    },
    "@squide/react-router": {
        singleton: true,
        eager: true
    }
};

export type Router = "react-router";

export function resolveDefaultSharedDependencies(router: Router) {
    return {
        ...DefaultSharedDependencies,
        ...(router === "react-router" ? ReactRouterSharedDependencies : {})
    };
}

export interface DefineHostModuleFederationPluginOptions extends ModuleFederationPluginOptions {
    router?: Router;
}

////////////////////////////  Host  /////////////////////////////

// The function return type is mandatory, otherwise we got an error TS4058.
export function defineHostModuleFederationPluginOptions(applicationName: string, options: DefineHostModuleFederationPluginOptions): ModuleFederationPluginOptions {
    const {
        router = "react-router",
        shared = {},
        ...rest
    } = options;


    const defaultSharedDependencies = resolveDefaultSharedDependencies(router);

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

export interface DefineDevHostConfigOptions extends Omit<DefineDevConfigOptions, "htmlWebpackPlugin" | "fastRefresh" | "port"> {
    htmlWebpackPluginOptions?: HtmlWebpackPlugin.Options;
    router?: Router;
    sharedDependencies?: ModuleFederationPluginOptions["shared"];
    moduleFederationPluginOptions?: ModuleFederationPluginOptions;
}

// The function return type is mandatory, otherwise we got an error TS4058.
export function defineDevHostConfig(swcConfig: SwcConfig, applicationName: string, port: number, options: DefineDevHostConfigOptions = {}): webpack.Configuration {
    const {
        entry = path.resolve("./src/index.ts"),
        cache = false,
        plugins = [],
        htmlWebpackPluginOptions,
        router,
        sharedDependencies,
        moduleFederationPluginOptions = defineHostModuleFederationPluginOptions(applicationName, { router, shared: sharedDependencies }),
        ...webpackOptions
    } = options;

    return defineDevConfig(swcConfig, {
        entry,
        port,
        cache,
        fastRefresh: false,
        htmlWebpackPlugin: htmlWebpackPluginOptions,
        plugins: [
            ...plugins,
            new webpack.container.ModuleFederationPlugin(moduleFederationPluginOptions)
        ],
        ...webpackOptions
    });
}

export interface DefineBuildHostConfigOptions extends Omit<DefineBuildConfigOptions, "htmlWebpackPlugin" | "publicPath"> {
    htmlWebpackPluginOptions?: HtmlWebpackPlugin.Options;
    router?: Router;
    sharedDependencies?: ModuleFederationPluginOptions["shared"];
    moduleFederationPluginOptions?: ModuleFederationPluginOptions;
}

// The function return type is mandatory, otherwise we got an error TS4058.
export function defineBuildHostConfig(swcConfig: SwcConfig, applicationName: string, publicPath: string, options: DefineBuildHostConfigOptions = {}): webpack.Configuration {
    const {
        entry = path.resolve("./src/index.ts"),
        cache = false,
        plugins = [],
        htmlWebpackPluginOptions,
        router,
        sharedDependencies,
        moduleFederationPluginOptions = defineHostModuleFederationPluginOptions(applicationName, { router, shared: sharedDependencies }),
        ...webpackOptions
    } = options;

    return defineBuildConfig(swcConfig, {
        entry,
        publicPath,
        cache,
        htmlWebpackPlugin: htmlWebpackPluginOptions,
        plugins: [
            ...plugins,
            new webpack.container.ModuleFederationPlugin(moduleFederationPluginOptions)
        ],
        ...webpackOptions
    });
}

////////////////////////////  Remote  /////////////////////////////

export interface DefineRemoteModuleFederationPluginOptions extends ModuleFederationPluginOptions {
    router?: Router;
}

// The function return type is mandatory, otherwise we got an error TS4058.
export function defineRemoteModuleFederationPluginOptions(applicationName: string, options: DefineRemoteModuleFederationPluginOptions): ModuleFederationPluginOptions {
    const {
        router = "react-router",
        exposes = {},
        shared = {},
        ...rest
    } = options;

    const defaultSharedDependencies = resolveDefaultSharedDependencies(router);

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

export interface DefineDevRemoteModuleConfigOptions extends Omit<DefineDevConfigOptions, "fastRefresh" | "port"> {
    router?: Router;
    sharedDependencies?: ModuleFederationPluginOptions["shared"];
    moduleFederationPluginOptions?: ModuleFederationPluginOptions;
}

// The function return type is mandatory, otherwise we got an error TS4058.
export function defineDevRemoteModuleConfig(swcConfig: SwcConfig, applicationName: string, port: number, options: DefineDevRemoteModuleConfigOptions = {}): webpack.Configuration {
    const {
        entry = path.resolve("./src/register.tsx"),
        cache = false,
        plugins = [],
        htmlWebpackPlugin = false,
        transformers = [],
        router,
        sharedDependencies,
        moduleFederationPluginOptions = defineRemoteModuleFederationPluginOptions(applicationName, { router, shared: sharedDependencies }),
        ...webpackOptions
    } = options;

    return defineDevConfig(swcConfig, {
        entry,
        port,
        cache,
        fastRefresh: false,
        htmlWebpackPlugin,
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

export interface DefineBuildRemoteModuleConfigOptions extends Omit<DefineBuildConfigOptions, "publicPath"> {
    router?: Router;
    sharedDependencies?: ModuleFederationPluginOptions["shared"];
    moduleFederationPluginOptions?: ModuleFederationPluginOptions;
}

// The function return type is mandatory, otherwise we got an error TS4058.
export function defineBuildRemoteModuleConfig(swcConfig: SwcConfig, applicationName: string, publicPath: string, options: DefineBuildRemoteModuleConfigOptions = {}): webpack.Configuration {
    const {
        entry = path.resolve("./src/register.tsx"),
        cache = false,
        plugins = [],
        htmlWebpackPlugin = false,
        router,
        sharedDependencies,
        moduleFederationPluginOptions = defineRemoteModuleFederationPluginOptions(applicationName, { router, shared: sharedDependencies }),
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
        ...webpackOptions
    });
}