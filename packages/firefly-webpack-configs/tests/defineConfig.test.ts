import { ModuleFederationPlugin } from "@module-federation/enhanced/webpack";
import type { ModuleFederationPluginOptions } from "@squide/webpack-configs";
import { defineBuildConfig as defineSwcBuildConfig, defineDevConfig as defineSwcDevConfig } from "@workleap/swc-configs";
import { findPlugin, matchConstructorName } from "@workleap/webpack-configs";
import type { WebpackPluginInstance } from "webpack";
import { defineBuildHostConfig, defineBuildRemoteModuleConfig, defineDevHostConfig, defineDevRemoteModuleConfig } from "../src/index.ts";

// The following options are relative to the environment running the test and breaks on CI.
function prepareModuleFederationPluginForSnapshot(plugin: WebpackPluginInstance) {
    delete (plugin._options as ModuleFederationPluginOptions)["runtimePlugins"];

    return plugin;
}

describe("defineDevHostConfig", () => {
    const SwcConfig = defineSwcDevConfig({
        chrome: "116"
    });

    test("includes react-router and msw dependencies", () => {
        const config = defineDevHostConfig(SwcConfig, 8080, []);
        const result = findPlugin(config, matchConstructorName(ModuleFederationPlugin.name));

        expect(prepareModuleFederationPluginForSnapshot(result.plugin as WebpackPluginInstance)).toMatchSnapshot();
    });
});

describe("defineBuildHostConfig", () => {
    const SwcConfig = defineSwcBuildConfig({
        chrome: "116"
    });

    test("includes react-router and msw dependencies", () => {
        const config = defineBuildHostConfig(SwcConfig, []);
        const result = findPlugin(config, matchConstructorName(ModuleFederationPlugin.name));

        expect(prepareModuleFederationPluginForSnapshot(result.plugin as WebpackPluginInstance)).toMatchSnapshot();
    });
});

describe("defineDevRemoteModuleConfig", () => {
    const SwcConfig = defineSwcDevConfig({
        chrome: "116"
    });

    test("includes react-router and msw dependencies", () => {
        const config = defineDevRemoteModuleConfig(SwcConfig, "remote1", 8081);
        const result = findPlugin(config, matchConstructorName(ModuleFederationPlugin.name));

        expect(prepareModuleFederationPluginForSnapshot(result.plugin as WebpackPluginInstance)).toMatchSnapshot();
    });
});

describe("defineBuildRemoteModuleConfig", () => {
    const SwcConfig = defineSwcBuildConfig({
        chrome: "116"
    });

    test("includes react-router and msw dependencies", () => {
        const config = defineBuildRemoteModuleConfig(SwcConfig, "remote1");
        const result = findPlugin(config, matchConstructorName(ModuleFederationPlugin.name));

        expect(prepareModuleFederationPluginForSnapshot(result.plugin as WebpackPluginInstance)).toMatchSnapshot();
    });
});


