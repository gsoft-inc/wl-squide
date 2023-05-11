/*
TODO: Add snapshot test with at least those use cases:
    - plugins array doesn't exist
    - ModuleFederationPlugin has already been configured
    - pluginOptions already contains a "shared" section
    - pluginOptions doesn't contains a "shared" section
    - with additional shared dependencies
    - with reactOptions (and all the other similar options)
*/

import type { ModuleFederationPluginOptions, SharedObject } from "./ModuleFederationPlugin.d.ts";
import { RemoteEntryPoint, RemoteModuleName } from "./remoteDefinition.ts";

import type { Configuration } from "webpack";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import ModuleFederationPlugin from "webpack/lib/container/ModuleFederationPlugin.js";
import merge from "deepmerge";

export interface ModuleFederationOptions {
    router: "react-router";
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

function createSharedObject({ router, pluginOptions = {} }: ModuleFederationOptions): SharedObject {
    return merge.all([
        DefaultSharedDependencies,
        router === "react-router" ? ReactRouterSharedDependencies : {},
        pluginOptions.shared ?? {}
    ]) as SharedObject;
}

export function hostTransformer(config: Configuration, moduleName: string, options: ModuleFederationOptions = { router: "react-router" }) {
    const pluginOptions: ModuleFederationPluginOptions = {
        name: moduleName,
        shared: createSharedObject(options)
    };

    config.plugins = config.plugins ?? [];
    config.plugins.push(new ModuleFederationPlugin(pluginOptions));
}

export function remoteTransformer(config: Configuration, moduleName: string, options: ModuleFederationOptions = { router: "react-router" }) {
    const pluginOptions: ModuleFederationPluginOptions = {
        name: moduleName,
        filename: RemoteEntryPoint,
        exposes: {
            [RemoteModuleName]: "./src/register"
        },
        shared: createSharedObject(options)
    };

    config.plugins = config.plugins ?? [];
    config.plugins.push(new ModuleFederationPlugin(pluginOptions));
}
