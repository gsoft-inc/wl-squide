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
    type Router
} from "@squide/webpack-configs";
import type { SwcConfig } from "@workleap/swc-configs";
import type webpack from "webpack";

export {
    DefineBuildHostConfigOptions, DefineBuildRemoteModuleConfigOptions, DefineDevHostConfigOptions, DefineDevRemoteModuleConfigOptions, DefineHostModuleFederationPluginOptions, DefineRemoteModuleFederationPluginOptions, Features, ModuleFederationPluginOptions,
    Router, defineRemoteModuleFederationPluginOptions
};

// The function return type is mandatory, otherwise we got an error TS4058.
export function defineDevHostConfig(swcConfig: SwcConfig, applicationName: string, port: number, options: Omit<DefineDevHostConfigOptions, "features"> = {}): webpack.Configuration {
    return baseDefineDevHostConfig(swcConfig, applicationName, port, {
        ...options,
        features: {
            router: "react-router",
            msw: true
        }
    });
}

// The function return type is mandatory, otherwise we got an error TS4058.
export function defineBuildHostConfig(swcConfig: SwcConfig, applicationName: string, options: Omit<DefineBuildHostConfigOptions, "features"> = {}): webpack.Configuration {
    return baseDefineBuildHostConfig(swcConfig, applicationName, {
        ...options,
        features: {
            router: "react-router",
            msw: true
        }
    });
}

// The function return type is mandatory, otherwise we got an error TS4058.
export function defineDevRemoteModuleConfig(swcConfig: SwcConfig, applicationName: string, port: number, options: Omit<DefineDevRemoteModuleConfigOptions, "features"> = {}): webpack.Configuration {
    return baseDefineDevRemoteModuleConfig(swcConfig, applicationName, port, {
        ...options,
        features: {
            router: "react-router",
            msw: true
        }
    });
}

// The function return type is mandatory, otherwise we got an error TS4058.
export function defineBuildRemoteModuleConfig(swcConfig: SwcConfig, applicationName: string, options: Omit<DefineBuildRemoteModuleConfigOptions, "features"> = {}): webpack.Configuration {
    return baseDefineBuildRemoteModuleConfig(swcConfig, applicationName, {
        ...options,
        features: {
            router: "react-router",
            msw: true
        }
    });
}
