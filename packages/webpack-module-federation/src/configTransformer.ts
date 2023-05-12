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
import { container, type Configuration } from "webpack";
import merge from "deepmerge";

type ModuleFederationPluginOptions = ConstructorParameters<typeof container.ModuleFederationPlugin>[0];
type SharedDependency = ModuleFederationPluginOptions["shared"];

export interface ModuleFederationOptions {
    router?: "react-router";
    pluginOptions?: ModuleFederationPluginOptions;
}

const DefaultSharedDependencies: SharedDependency = {
    "react": {
        singleton: true
    },
    "react-dom": {
        singleton: true
    },
    "@squide/core": {
        singleton: true
    },
    "@squide/webpack-module-federation": {
        singleton: true
    }
};

const ReactRouterSharedDependencies: SharedDependency = {
    "react-router-dom": {
        singleton: true
    },
    "@squide/react-router": {
        singleton: true
    }
};

function createSharedObject({ router = "react-router", pluginOptions = {} }: ModuleFederationOptions) {
    return merge.all<SharedDependency>([
        DefaultSharedDependencies,
        router === "react-router" ? ReactRouterSharedDependencies : {},
        pluginOptions.shared ?? {}
    ]);
}

export function hostTransformer(config: Configuration, name: string, options: ModuleFederationOptions = {}) {
    const pluginOptions: ModuleFederationPluginOptions = {
        name,
        shared: createSharedObject(options)
    };

    config.plugins = config.plugins ?? [];
    config.plugins.push(new container.ModuleFederationPlugin(pluginOptions));

    return config;
}

export function remoteTransformer(config: Configuration, name: string, options: ModuleFederationOptions = {}) {
    const pluginOptions: ModuleFederationPluginOptions = {
        name,
        filename: RemoteEntryPoint,
        exposes: {
            [RemoteModuleName]: "./src/register"
        },
        shared: createSharedObject(options)
    };

    config.plugins = config.plugins ?? [];
    config.plugins.push(new container.ModuleFederationPlugin(pluginOptions));

    return config;
}
