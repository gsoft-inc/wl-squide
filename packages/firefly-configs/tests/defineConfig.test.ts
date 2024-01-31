import { defineBuildConfig as defineSwcBuildConfig, defineDevConfig as defineSwcDevConfig } from "@workleap/swc-configs";
import { findPlugin, matchConstructorName } from "@workleap/webpack-configs";
import webpack from "webpack";
import { defineBuildHostConfig, defineBuildRemoteModuleConfig, defineDevHostConfig, defineDevRemoteModuleConfig } from "../src/index.ts";

describe("defineDevHostConfig", () => {
    const SwcConfig = defineSwcDevConfig({
        chrome: "116"
    });

    test("includes react-router and msw dependencies", () => {
        const config = defineDevHostConfig(SwcConfig, "host", 8080);
        const result = findPlugin(config, matchConstructorName(webpack.container.ModuleFederationPlugin.name));

        expect(result).toMatchSnapshot();
    });
});

describe("defineBuildHostConfig", () => {
    const SwcConfig = defineSwcBuildConfig({
        chrome: "116"
    });

    test("includes react-router and msw dependencies", () => {
        const config = defineBuildHostConfig(SwcConfig, "host");
        const result = findPlugin(config, matchConstructorName(webpack.container.ModuleFederationPlugin.name));

        expect(result).toMatchSnapshot();
    });
});

describe("defineDevRemoteModuleConfig", () => {
    const SwcConfig = defineSwcDevConfig({
        chrome: "116"
    });

    test("includes react-router and msw dependencies", () => {
        const config = defineDevRemoteModuleConfig(SwcConfig, "remote1", 8081);
        const result = findPlugin(config, matchConstructorName(webpack.container.ModuleFederationPlugin.name));

        expect(result).toMatchSnapshot();
    });
});

describe("defineBuildRemoteModuleConfig", () => {
    const SwcConfig = defineSwcBuildConfig({
        chrome: "116"
    });

    test("includes react-router and msw dependencies", () => {
        const config = defineBuildRemoteModuleConfig(SwcConfig, "remote1");
        const result = findPlugin(config, matchConstructorName(webpack.container.ModuleFederationPlugin.name));

        expect(result).toMatchSnapshot();
    });
});


