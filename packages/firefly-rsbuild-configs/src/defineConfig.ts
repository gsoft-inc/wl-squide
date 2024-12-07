import { pluginModuleFederation } from "@module-federation/rsbuild-plugin";
import type { RsbuildConfig } from "@rsbuild/core";
import merge from "deepmerge";
import path from "node:path";
import url from "node:url";
import type { RsbuildConfigTransformer } from "./rsbuild/applyTransformers.ts";
import { defineBuildConfig, type DefineBuildConfigOptions } from "./rsbuild/defineBuildConfig.ts";
import { defineDevConfig, type DefineDevConfigOptions } from "./rsbuild/defineDevConfig.ts";
import { HostApplicationName } from "./shared.ts";

// Using import.meta.url instead of import.meta.dirname because Jest is throwing the following error:
// SyntaxError: Cannot use 'import.meta' outside a module
const packageDirectory = url.fileURLToPath(new URL(".", import.meta.url));

// Must be similar to the module name defined in @workleap/module-federation.
const RemoteRegisterModuleName = "./register";
const RemoteEntryPoint = "remoteEntry.js";

// Webpack doesn't export ModuleFederationPlugin typings.
export type ModuleFederationPluginOptions = Parameters<typeof pluginModuleFederation>[0];
export type ModuleFederationRemotesOption = ModuleFederationPluginOptions["remotes"];

export type ModuleFederationRuntimePlugins = NonNullable<ModuleFederationPluginOptions["runtimePlugins"]>;
export type ModuleFederationShared = NonNullable<ModuleFederationPluginOptions["shared"]>;

// Generally, only the host application should have eager dependencies.
// For more informations about shared dependencies refer to: https://github.com/patricklafrance/wmf-versioning
function getDefaultSharedDependencies(features: Features, isHost: boolean): ModuleFederationShared {
    return {
        "react": {
            singleton: true,
            eager: isHost ? true : undefined,
            // Fixed the warning when `react-i18next` is imported in any remote modules.
            // For more information, refer to: https://github.com/i18next/react-i18next/issues/1697#issuecomment-1821748226.
            requiredVersion: features.i18next ? false : undefined
        },
        "react-dom": {
            singleton: true,
            eager: isHost ? true : undefined
        },
        "@squide/core": {
            singleton: true,
            eager: isHost ? true : undefined
        },
        "@squide/module-federation": {
            singleton: true,
            eager: isHost ? true : undefined
        }
    };
}

export type Router = "react-router";

export interface Features {
    router?: Router;
    msw?: boolean;
    i18next?: boolean;
    environmentVariables?: boolean;
    honeycomb?: boolean;
}

// Generally, only the host application should have eager dependencies.
// For more informations about shared dependencies refer to: https://github.com/patricklafrance/wmf-versioning
function getReactRouterSharedDependencies(isHost: boolean): ModuleFederationShared {
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

function getMswSharedDependency(isHost: boolean): ModuleFederationShared {
    return {
        "@squide/msw": {
            singleton: true,
            eager: isHost ? true : undefined
        }
    };
}

function getI18nextSharedDependency(isHost: boolean): ModuleFederationShared {
    return {
        "i18next": {
            singleton: true,
            eager: isHost ? true : undefined
        },
        // Not adding as a shared dependency for the moment because it causes the following error:
        // Uncaught (in promise) TypeError: i18next_browser_languagedetector__WEBPACK_IMPORTED_MODULE_3__ is not a constructor
        // "i18next-browser-languagedetector": {
        //     singleton: true,
        //     eager: isHost ? true : undefined
        // },
        "react-i18next": {
            singleton: true,
            eager: isHost ? true : undefined
        },
        "@squide/i18next": {
            singleton: true,
            eager: isHost ? true : undefined
        }
    };
}

function getEnvironmentVariablesSharedDependencies(isHost: boolean): ModuleFederationShared {
    return {
        "@squide/env-vars": {
            singleton: true,
            eager: isHost ? true : undefined
        }
    };
}

// TODO: Should add "@opentelemetry/api"
function getHoneycombSharedDependencies(isHost: boolean): ModuleFederationShared {
    return {
        "@squide/firefly-honeycomb": {
            singleton: true,
            eager: isHost ? true : undefined
        }
    };
}

function getFeaturesDependencies(features: Features, isHost: boolean) {
    const {
        router = "react-router",
        msw = true,
        i18next,
        environmentVariables,
        honeycomb
    } = features;

    return {
        ...(router === "react-router" ? getReactRouterSharedDependencies(isHost) : {}),
        ...(msw ? getMswSharedDependency(isHost) : {}),
        ...(i18next ? getI18nextSharedDependency(isHost) : {}),
        ...(environmentVariables ? getEnvironmentVariablesSharedDependencies(isHost) : {}),
        ...(honeycomb ? getHoneycombSharedDependencies(isHost) : {})
    };
}

function resolveDefaultSharedDependencies(features: Features, isHost: boolean) {
    return {
        ...getDefaultSharedDependencies(features, isHost),
        ...getFeaturesDependencies(features, isHost)
    };
}

const forceNamedChunkIdsTransformer: RsbuildConfigTransformer = (config: RsbuildConfig) => {
    config.tools = config.tools ?? {};
    config.tools.rspack = config.tools.rspack ?? {};

    // The typings are broken because "rspack" also accepts a function.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    config.tools.rspack.optimization = {
        // The typings are broken because "rspack" also accepts a function.
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        ...(config.tools.rspack.optimization ?? {}),
        chunkIds: "named"
    };

    return config;
};

////////////////////////////  Host  /////////////////////////////

export interface RemoteDefinition {
    // The name of the remote module.
    name: string;
    // The URL of the remote, ex: http://localhost:8081.
    url: string;
}

export interface DefineHostModuleFederationPluginOptions extends ModuleFederationPluginOptions {
    features?: Features;
}

// The function return type is mandatory, otherwise we got an error TS4058.
export function defineHostModuleFederationPluginOptions(remotes: RemoteDefinition[], options: DefineHostModuleFederationPluginOptions): ModuleFederationPluginOptions {
    const {
        features = {},
        shared = {},
        runtimePlugins = [],
        ...rest
    } = options;

    const defaultSharedDependencies = resolveDefaultSharedDependencies(features, true);

    return {
        // shareStrategy: "loaded-first",
        name: HostApplicationName,
        // Since Squide modules are only exporting a register function with a standardized API
        // it doesn't requires any typing.
        dts: false,
        // Currently only supporting .js remotes.
        manifest: false,
        remotes: remotes.reduce((acc, x) => {
            // Object reduce are always a mess for typings.
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            acc[x.name] = `${x.name}@${x.url}/${RemoteEntryPoint}`;

            return acc;
        }, {}) as ModuleFederationRemotesOption,
        // Deep merging the default shared dependencies with the provided shared dependencies
        // to allow the consumer to easily override a default option of a shared dependency
        // without extending the whole default shared dependencies object.
        shared: merge.all([
            defaultSharedDependencies,
            shared
        ]) as ModuleFederationShared,
        runtimePlugins: [
            path.resolve(packageDirectory, "./sharedDependenciesResolutionPlugin.js"),
            path.resolve(packageDirectory, "./nonCacheableRemoteEntryPlugin.js"),
            ...runtimePlugins
        ],
        // Commented because it doesn't seems to work, the runtime is still embedded into remotes.
        // experiments: {
        //     // The runtime is 100kb minified.
        //     federationRuntime: "hoisted"
        // },
        ...rest
    };
}

export interface DefineDevHostConfigOptions extends Omit<DefineDevConfigOptions, "htmlWebpackPlugin" | "port"> {
    features?: Features;
    sharedDependencies?: ModuleFederationShared;
    runtimePlugins?: ModuleFederationRuntimePlugins;
    moduleFederationPluginOptions?: ModuleFederationPluginOptions;
}

// The function return type is mandatory, otherwise we got an error TS4058.
export function defineDevHostConfig(port: number, remotes: RemoteDefinition[], options: DefineDevHostConfigOptions = {}): RsbuildConfig {
    const {
        entry = {
            index: path.resolve("./src/index.tsx")
        },
        assetPrefix = "auto",
        plugins = [],
        // Breaks the initialization of the shell when true, usually causing a blank page.
        lazyCompilation = false,
        features,
        sharedDependencies,
        runtimePlugins,
        moduleFederationPluginOptions = defineHostModuleFederationPluginOptions(remotes, { features, shared: sharedDependencies, runtimePlugins }),
        ...rsbuildOptions
    } = options;

    return defineDevConfig({
        entry,
        port,
        assetPrefix,
        plugins: [
            ...plugins,
            pluginModuleFederation(moduleFederationPluginOptions)
        ],
        lazyCompilation,
        ...rsbuildOptions
    });
}

export interface DefineBuildHostConfigOptions extends DefineBuildConfigOptions {
    features?: Features;
    sharedDependencies?: ModuleFederationShared;
    runtimePlugins?: ModuleFederationRuntimePlugins;
    moduleFederationPluginOptions?: ModuleFederationPluginOptions;
}

// The function return type is mandatory, otherwise we got an error TS4058.
export function defineBuildHostConfig(remotes: RemoteDefinition[], options: DefineBuildHostConfigOptions = {}): RsbuildConfig {
    const {
        entry = {
            index: path.resolve("./src/index.tsx")
        },
        assetPrefix = "auto",
        plugins = [],
        features,
        sharedDependencies,
        runtimePlugins,
        moduleFederationPluginOptions = defineHostModuleFederationPluginOptions(remotes, { features, shared: sharedDependencies, runtimePlugins }),
        transformers = [],
        ...webpackOptions
    } = options;

    return defineBuildConfig({
        entry,
        assetPrefix,
        plugins: [
            ...plugins,
            pluginModuleFederation(moduleFederationPluginOptions)
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
        runtimePlugins = [],
        ...rest
    } = options;

    const defaultSharedDependencies = resolveDefaultSharedDependencies(features, false);

    return {
        // shareStrategy: "loaded-first",
        name: applicationName,
        // Since Squide modules are only exporting a register function with a standardized API
        // it doesn't requires any typing.
        dts: false,
        // Currently only supporting .js remotes.
        manifest: false,
        filename: RemoteEntryPoint,
        exposes: {
            [RemoteRegisterModuleName]: "./src/register",
            ...exposes
        },
        // Deep merging the default shared dependencies with the provided shared dependencies
        // to allow the consumer to easily override a default option of a shared dependency
        // without extending the whole default shared dependencies object.
        shared: merge.all([
            defaultSharedDependencies,
            shared
        ]) as ModuleFederationShared,
        runtimePlugins: [
            path.resolve(packageDirectory, "./sharedDependenciesResolutionPlugin.js"),
            path.resolve(packageDirectory, "./nonCacheableRemoteEntryPlugin.js"),
            ...runtimePlugins
        ],
        // Commented because it doesn't seems to work, the runtime is still embedded into remotes.
        // experiments: {
        //     // The runtime is 100kb minified.
        //     federationRuntime: "hoisted"
        // },
        ...rest
    };
}

export interface DefineDevRemoteModuleConfigOptions extends Omit<DefineDevConfigOptions, "port" | "overlay"> {
    features?: Features;
    sharedDependencies?: ModuleFederationShared;
    runtimePlugins?: ModuleFederationRuntimePlugins;
    moduleFederationPluginOptions?: ModuleFederationPluginOptions;
}

// The function return type is mandatory, otherwise we got an error TS4058.
export function defineDevRemoteModuleConfig(applicationName: string, port: number, options: DefineDevRemoteModuleConfigOptions = {}): RsbuildConfig {
    const {
        entry = {
            index: path.resolve("./src/register.tsx")
        },
        assetPrefix = "auto",
        plugins = [],
        // Breaks the initialization of the shell when true, usually causing a blank page.
        lazyCompilation = false,
        html = false,
        features,
        sharedDependencies,
        runtimePlugins,
        moduleFederationPluginOptions = defineRemoteModuleFederationPluginOptions(applicationName, { features, shared: sharedDependencies, runtimePlugins }),
        ...rsbuildOptions
    } = options;

    return defineDevConfig({
        entry,
        port,
        assetPrefix,
        // Disable the error overlay by default for remotes as otherwise every remote module's error overlay will be
        // stack on top of the host application's error overlay.
        overlay: false,
        plugins: [
            ...plugins,
            pluginModuleFederation(moduleFederationPluginOptions)
        ],
        lazyCompilation,
        html,
        ...rsbuildOptions
    });
}

export interface DefineBuildRemoteModuleConfigOptions extends DefineBuildConfigOptions {
    features?: Features;
    sharedDependencies?: ModuleFederationShared;
    runtimePlugins?: ModuleFederationRuntimePlugins;
    moduleFederationPluginOptions?: ModuleFederationPluginOptions;
}

// The function return type is mandatory, otherwise we got an error TS4058.
export function defineBuildRemoteModuleConfig(applicationName: string, options: DefineBuildRemoteModuleConfigOptions = {}): RsbuildConfig {
    const {
        entry = {
            index: path.resolve("./src/register.tsx")
        },
        assetPrefix = "auto",
        plugins = [],
        html = false,
        features,
        sharedDependencies,
        runtimePlugins,
        moduleFederationPluginOptions = defineRemoteModuleFederationPluginOptions(applicationName, { features, shared: sharedDependencies, runtimePlugins }),
        transformers = [],
        ...rsbuildOptions
    } = options;

    return defineBuildConfig({
        entry,
        assetPrefix,
        plugins: [
            ...plugins,
            pluginModuleFederation(moduleFederationPluginOptions)
        ],
        html,
        transformers: [
            forceNamedChunkIdsTransformer,
            ...transformers
        ],
        ...rsbuildOptions
    });
}
