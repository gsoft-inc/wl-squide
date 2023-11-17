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
    DefineHostModuleFederationPluginOptions, DefineRemoteModuleFederationPluginOptions, ModuleFederationPluginOptions, Router, defineRemoteModuleFederationPluginOptions
};

export type FireflyFeatures = Omit<Features, "router" | "msw">;

export interface FireflyDefineDevHostConfigOptions extends DefineDevHostConfigOptions {
    features?: FireflyFeatures;
}

// The function return type is mandatory, otherwise we got an error TS4058.
export function defineDevHostConfig(swcConfig: SwcConfig, applicationName: string, port: number, { features, ...otherOptions }: FireflyDefineDevHostConfigOptions = {}): webpack.Configuration {
    return baseDefineDevHostConfig(swcConfig, applicationName, port, {
        ...otherOptions,
        features: {
            router: "react-router",
            msw: true,
            ...(features ?? {})
        }
    });
}

export interface FireflyDefineBuildHostConfigOptions extends DefineBuildHostConfigOptions {
    features?: FireflyFeatures;
}

// The function return type is mandatory, otherwise we got an error TS4058.
export function defineBuildHostConfig(swcConfig: SwcConfig, applicationName: string, { features, ...otherOptions }: FireflyDefineBuildHostConfigOptions = {}): webpack.Configuration {
    return baseDefineBuildHostConfig(swcConfig, applicationName, {
        ...otherOptions,
        features: {
            router: "react-router",
            msw: true,
            ...(features ?? {})
        }
    });
}

export interface FireflyDefineDevRemoteModuleConfigOptions extends DefineDevRemoteModuleConfigOptions {
    features?: FireflyFeatures;
}

// The function return type is mandatory, otherwise we got an error TS4058.
export function defineDevRemoteModuleConfig(swcConfig: SwcConfig, applicationName: string, port: number, { features, ...otherOptions }: FireflyDefineDevRemoteModuleConfigOptions = {}): webpack.Configuration {
    return baseDefineDevRemoteModuleConfig(swcConfig, applicationName, port, {
        ...otherOptions,
        features: {
            router: "react-router",
            msw: true,
            ...(features ?? {})
        }
    });
}

export interface FireflyDefineBuildRemoteModuleConfigOptions extends DefineBuildRemoteModuleConfigOptions {
    features?: FireflyFeatures;
}

// The function return type is mandatory, otherwise we got an error TS4058.
export function defineBuildRemoteModuleConfig(swcConfig: SwcConfig, applicationName: string, { features, ...otherOptions }: FireflyDefineBuildRemoteModuleConfigOptions = {}): webpack.Configuration {
    return baseDefineBuildRemoteModuleConfig(swcConfig, applicationName, {
        ...otherOptions,
        features: {
            router: "react-router",
            msw: true,
            ...(features ?? {})
        }
    });
}
