/*
TODO: Add snapshot tests with at least those use cases:
    - plugins array doesn't exist
    - ModuleFederationPlugin has already been configured
    - pluginOptions already contains a "shared" section
    - pluginOptions doesn't contains a "shared" section
    - with additional shared dependencies
    - with reactOptions (and all the other similar options)
    - with additional "exposes" for a remote
    - with a different filename for a remote
*/

import { RemoteEntryPoint, RemoteModuleName } from "./remoteDefinition.ts";

import merge from "deepmerge";
import webpack from "webpack";

// Webpack doesn't export ModuleFederationPlugin typings.
export type ModuleFederationPluginOptions = ConstructorParameters<typeof webpack.container.ModuleFederationPlugin>[0];
export type SharedDependency = ModuleFederationPluginOptions["shared"];

export interface ModuleFederationOptions {
    router?: "react-router";
    pluginOptions?: ModuleFederationPluginOptions;
}

const DefaultSharedDependencies: SharedDependency = {
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

const ReactRouterSharedDependencies: SharedDependency = {
    "react-router-dom": {
        singleton: true,
        eager: true
    },
    "@squide/react-router": {
        singleton: true,
        eager: true
    }
};

function createSharedObject({ router = "react-router", pluginOptions = {} }: ModuleFederationOptions) {
    return merge.all<SharedDependency>([
        DefaultSharedDependencies,
        router === "react-router" ? ReactRouterSharedDependencies : {},
        pluginOptions.shared ?? {}
    ]);
}

export function hostTransformer(config: webpack.Configuration, name: string, options: ModuleFederationOptions = {}) {
    const pluginOptions: ModuleFederationPluginOptions = {
        name,
        shared: createSharedObject(options)
    };

    return {
        ...config,
        plugins: [
            ...(config.plugins ?? []),
            new webpack.container.ModuleFederationPlugin(pluginOptions)
        ]
    };
}

export function remoteTransformer(config: webpack.Configuration, name: string, options: ModuleFederationOptions = {}) {
    const pluginOptions: ModuleFederationPluginOptions = {
        name,
        filename: RemoteEntryPoint,
        exposes: {
            [RemoteModuleName]: "./src/register"
        },
        shared: createSharedObject(options)
    };

    return {
        ...config,
        plugins: [
            ...(config.plugins ?? []),
            new webpack.container.ModuleFederationPlugin(pluginOptions)
        ]
    };
}
