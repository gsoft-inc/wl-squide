import { RemoteEntryPoint, RemoteModuleName } from "./remoteDefinition.ts";

import { isNil } from "@squide/core";
import merge from "deepmerge";
import webpack from "webpack";

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

function validateConfig(config: webpack.Configuration) {
    // There doesn't seem to be an exported Webpack type for this.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!isNil(config.plugins) && config.plugins.some((x: any) => x.constructor.name === webpack.container.ModuleFederationPlugin.name)) {
        throw new Error("ModuleFederationPlugin has already been configured. Please remove ModuleFederationPlugin from your configuration plugins before calling this function.");
    }
}

export function hostTransformer(config: webpack.Configuration, name: string, options: ModuleFederationOptions = {}): webpack.Configuration {
    validateConfig(config);

    const pluginOptions = resolvePluginOptions({ name }, options);

    return {
        ...config,
        plugins: [
            ...(config.plugins ?? []),
            new webpack.container.ModuleFederationPlugin(pluginOptions)
        ]
    };
}

export function remoteTransformer(config: webpack.Configuration, name: string, options: ModuleFederationOptions = {}): webpack.Configuration {
    validateConfig(config);

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
