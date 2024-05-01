import {
    defineBuildHostConfig as baseDefineBuildHostConfig,
    defineBuildRemoteModuleConfig as baseDefineBuildRemoteModuleConfig,
    defineDevHostConfig as baseDefineDevHostConfig,
    defineDevRemoteModuleConfig as baseDefineDevRemoteModuleConfig,
    defineRemoteModuleFederationPluginOptions,
    type DefineBuildHostConfigOptions,
    type DefineBuildRemoteModuleConfigOptions,
    type DefineDevHostConfigOptions,
    type DefineDevRemoteModuleConfigOptions,
    type DefineHostModuleFederationPluginOptions,
    type DefineRemoteModuleFederationPluginOptions,
    type Features,
    type ModuleFederationPluginOptions,
    type RemoteDefinition,
    type Router
} from "@squide/webpack-configs";
import type { SwcConfig } from "@workleap/swc-configs";
import type webpack from "webpack";

export * from "@workleap/webpack-configs";

export {
    DefineHostModuleFederationPluginOptions,
    DefineRemoteModuleFederationPluginOptions,
    ModuleFederationPluginOptions,
    RemoteDefinition,
    Router,
    defineRemoteModuleFederationPluginOptions
};

export type FireflyFeatures = Omit<Features, "router" | "msw">;

export interface FireflyDefineDevHostConfigOptions extends DefineDevHostConfigOptions {
    features?: FireflyFeatures;
}

// The function return type is mandatory, otherwise we get an error TS4058.
export function defineDevHostConfig(swcConfig: SwcConfig, port: number, remotes: RemoteDefinition[], { features = {}, ...options }: FireflyDefineDevHostConfigOptions = {}): webpack.Configuration {
    return baseDefineDevHostConfig(swcConfig, port, remotes, {
        ...options,
        features: {
            router: "react-router",
            msw: true,
            ...features
        }
    });
}

export interface FireflyDefineBuildHostConfigOptions extends DefineBuildHostConfigOptions {
    features?: FireflyFeatures;
}

// The function return type is mandatory, otherwise we get an error TS4058.
export function defineBuildHostConfig(swcConfig: SwcConfig, remotes: RemoteDefinition[], { features = {}, ...options }: FireflyDefineBuildHostConfigOptions = {}): webpack.Configuration {
    return baseDefineBuildHostConfig(swcConfig, remotes, {
        ...options,
        features: {
            router: "react-router",
            msw: true,
            ...features
        }
    });
}

export interface FireflyDefineDevRemoteModuleConfigOptions extends DefineDevRemoteModuleConfigOptions {
    features?: FireflyFeatures;
}

// The function return type is mandatory, otherwise we get an error TS4058.
export function defineDevRemoteModuleConfig(swcConfig: SwcConfig, applicationName: string, port: number, { features = {}, ...options }: FireflyDefineDevRemoteModuleConfigOptions = {}): webpack.Configuration {
    return baseDefineDevRemoteModuleConfig(swcConfig, applicationName, port, {
        ...options,
        features: {
            router: "react-router",
            msw: true,
            ...features
        }
    });
}

export interface FireflyDefineBuildRemoteModuleConfigOptions extends DefineBuildRemoteModuleConfigOptions {
    features?: FireflyFeatures;
}

// The function return type is mandatory, otherwise we get an error TS4058.
export function defineBuildRemoteModuleConfig(swcConfig: SwcConfig, applicationName: string, { features = {}, ...options }: FireflyDefineBuildRemoteModuleConfigOptions = {}): webpack.Configuration {
    return baseDefineBuildRemoteModuleConfig(swcConfig, applicationName, {
        ...options,
        features: {
            router: "react-router",
            msw: true,
            ...features
        }
    });
}
