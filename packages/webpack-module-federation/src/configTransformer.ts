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

import type { ModuleFederationPluginOptions, SharedObject } from "./ModuleFederationPlugin.d.ts";
import { RemoteEntryPoint, RemoteModuleName } from "./remoteDefinition.ts";

import type { Configuration } from "webpack";
// Types are not exported by webpack.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import ModuleFederationPlugin from "webpack/lib/container/ModuleFederationPlugin.js";
import merge from "deepmerge";

export interface ModuleFederationOptions {
    router?: "react-router";
    pluginOptions?: ModuleFederationPluginOptions;
}

const DefaultSharedDependencies: SharedObject = {
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

const ReactRouterSharedDependencies: SharedObject = {
    "react-router-dom": {
        singleton: true
    },
    "@squide/react-router": {
        singleton: true
    }
};

function createSharedObject({ router = "react-router", pluginOptions = {} }: ModuleFederationOptions): SharedObject {
    return merge.all([
        DefaultSharedDependencies,
        router === "react-router" ? ReactRouterSharedDependencies : {},
        pluginOptions.shared ?? {}
    ]) as SharedObject;
}

export function hostTransformer(config: Configuration, name: string, options: ModuleFederationOptions = {}) {
    const pluginOptions: ModuleFederationPluginOptions = {
        name,
        shared: createSharedObject(options)
    };

    config.plugins = config.plugins ?? [];
    config.plugins.push(new ModuleFederationPlugin(pluginOptions));

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
    config.plugins.push(new ModuleFederationPlugin(pluginOptions));

    return config;
}
