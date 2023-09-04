import { isNil } from "@squide/core";
import { findPlugin, matchConstructorName, type WebpackConfig, type WebpackConfigTransformer, type WebpackConfigTransformerContext } from "@workleap/webpack-configs";
import merge from "deepmerge";
import webpack from "webpack";
import { RemoteEntryPoint, RemoteModuleName } from "./remoteDefinition.ts";

// Webpack doesn't export ModuleFederationPlugin typings.
export type ModuleFederationPluginOptions = ConstructorParameters<typeof webpack.container.ModuleFederationPlugin>[0];

export interface ModuleFederationOptions {
    router?: "react-router";
    pluginOptions?: ModuleFederationPluginOptions;
}

const DefaultSharedDependencies: ModuleFederationPluginOptions = {
    shared: {
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
    }
};

const ReactRouterSharedDependencies: ModuleFederationPluginOptions = {
    shared: {
        "react-router-dom": {
            singleton: true,
            eager: true
        },
        "@squide/react-router": {
            singleton: true,
            eager: true
        }
    }
};

function resolvePluginOptions(baseOptions: ModuleFederationPluginOptions, { router = "react-router", pluginOptions = {} }: ModuleFederationOptions) {
    return merge.all<ModuleFederationPluginOptions>([
        baseOptions,
        DefaultSharedDependencies,
        router === "react-router" ? ReactRouterSharedDependencies : {},
        pluginOptions
    ]);
}

function validateWebpackConfig(config: webpack.Configuration) {
    // There doesn't seem to be an exported webpack type for this.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!isNil(config.plugins) && config.plugins.some((x: any) => x.constructor.name === webpack.container.ModuleFederationPlugin.name)) {
        throw new Error("ModuleFederationPlugin has already been configured. Please remove ModuleFederationPlugin from your configuration plugins before calling this function.");
    }
}

function preflightWebpackConfig(config: webpack.Configuration) {
    const existingPlugin = findPlugin(config, matchConstructorName(webpack.container.ModuleFederationPlugin.name));

    if (existingPlugin) {
        throw new Error("@squide - ModuleFederationPlugin has already been configured. Please remove ModuleFederationPlugin from your configuration plugins before calling this function.");
    }
}

export function hostTransformer(config: webpack.Configuration, name: string, options: ModuleFederationOptions = {}): webpack.Configuration {
    validateWebpackConfig(config);

    const pluginOptions = resolvePluginOptions({ name }, options);

    return {
        ...config,
        plugins: [
            ...(config.plugins ?? []),
            new webpack.container.ModuleFederationPlugin(pluginOptions)
        ]
    };
}

export const hostTransformer2: WebpackConfigTransformer = (config: WebpackConfig) => {
    return config;
};

export function createHostTransformer(applicationName: string, options: ModuleFederationOptions = {}) {
    const transformer: WebpackConfigTransformer = (config: WebpackConfig) => {
        preflightWebpackConfig(config);

        const pluginOptions = resolvePluginOptions({ name: applicationName }, options);

        config.plugins = [
            ...(config.plugins ?? []),
            new webpack.container.ModuleFederationPlugin(pluginOptions)
        ];

        return config;
    };

    return transformer;
}

export function remoteTransformer(config: webpack.Configuration, name: string, options: ModuleFederationOptions = {}): webpack.Configuration {
    validateWebpackConfig(config);

    const pluginOptions = resolvePluginOptions({
        name,
        filename: RemoteEntryPoint,
        exposes: {
            [RemoteModuleName]: "./src/register"
        }
    }, options);

    return {
        ...config,
        plugins: [
            ...(config.plugins ?? []),
            new webpack.container.ModuleFederationPlugin(pluginOptions)
        ]
    };
}

export function createRemoteTransformer(applicationName: string, options: ModuleFederationOptions = {}) {
    const transformer: WebpackConfigTransformer = (config: WebpackConfig, context: WebpackConfigTransformerContext) => {
        preflightWebpackConfig(config);

        if (context.environment === "dev") {
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
        }

        const pluginOptions = resolvePluginOptions({
            name: applicationName,
            filename: RemoteEntryPoint,
            exposes: {
                [RemoteModuleName]: "./src/register"
            }
        }, options);

        config.plugins = [
            ...(config.plugins ?? []),
            new webpack.container.ModuleFederationPlugin(pluginOptions)
        ];

        return config;
    };

    return transformer;
}
