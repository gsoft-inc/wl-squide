import { defineBuildConfig as defineSwcBuildConfig, defineDevConfig as defineSwcDevConfig } from "@workleap/swc-configs";
import { findPlugin, matchConstructorName, type WebpackConfig } from "@workleap/webpack-configs";
import HtmlWebpackPlugin from "html-webpack-plugin";
import webpack from "webpack";
import { defineBuildHostConfig, defineBuildRemoteModuleConfig, defineDevHostConfig, defineDevRemoteModuleConfig, defineHostModuleFederationPluginOptions, defineRemoteModuleFederationPluginOptions } from "../src/defineConfig.ts";

class DummyPlugin {
    _options: unknown;

    constructor(options: unknown) {
        this._options = options;
    }

    apply() {
        console.log("Apply Dummy plugin.");
    }
}

describe("defineDevHostConfig", () => {
    const SwcConfig = defineSwcDevConfig({
        chrome: "116"
    });

    test("the application name is set as the federation plugin application name", () => {
        const config = defineDevHostConfig(SwcConfig, "host", 8080);
        const result = findPlugin(config, matchConstructorName(webpack.container.ModuleFederationPlugin.name));

        expect(result).toMatchSnapshot();
    });

    test("the port number is set as the dev server port and the public path port", () => {
        const result = defineDevHostConfig(SwcConfig, "host", 8080);

        // "devServer" does exist but webpack types are a messed.
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        expect(result.devServer.port).toBe(8080);
    });

    test("when no public path is provided, the default public path is \"auto\"", () => {
        const config = defineDevHostConfig(SwcConfig, "host", 8080);

        expect(config.output?.publicPath).toBe("auto");
    });

    test("when a public path is provided, use the provided public path", () => {
        const config = defineDevHostConfig(SwcConfig, "host", 8080, {
            publicPath: "http://localhost:8080/"
        });

        expect(config.output?.publicPath).toBe("http://localhost:8080/");
    });

    test("fast refresh is disabled", () => {
        const config = defineDevHostConfig(SwcConfig, "host", 8080);
        const result = findPlugin(config, matchConstructorName("ReactRefreshWebpackPlugin"));

        expect(result).toBeUndefined();
    });

    test("the module federation plugin configuration includes the default shared dependencies", () => {
        const config = defineDevHostConfig(SwcConfig, "host", 8080);
        const result = findPlugin(config, matchConstructorName(webpack.container.ModuleFederationPlugin.name));

        expect(result).toMatchSnapshot();
    });

    test("when additional shared dependencies are provided, add the dependencies to the module federation plugin configuration", () => {
        const config = defineDevHostConfig(SwcConfig, "host", 8080, {
            sharedDependencies: {
                "first": {
                    singleton: true
                },
                "second": {
                    eager: true,
                    singleton: true
                }
            }
        });

        const result = findPlugin(config, matchConstructorName(webpack.container.ModuleFederationPlugin.name));

        expect(result).toMatchSnapshot();
    });

    test("when additional options are provided for an existing default shared dependency, add the consumer options to the default options", () => {
        const config = defineDevHostConfig(SwcConfig, "host", 8080, {
            sharedDependencies: {
                "react": {
                    requiredVersion: "1.2.3"
                }
            }
        });

        const result = findPlugin(config, matchConstructorName(webpack.container.ModuleFederationPlugin.name));

        expect(result).toMatchSnapshot();
    });

    test("when overriding options are provided for a default shared dependency, use the consumer option", () => {
        const config = defineDevHostConfig(SwcConfig, "host", 8080, {
            sharedDependencies: {
                "react": {
                    eager: false,
                    singleton: false
                }
            }
        });

        const result = findPlugin(config, matchConstructorName(webpack.container.ModuleFederationPlugin.name));

        expect(result).toMatchSnapshot();
    });

    test("when the router is react-router, add react-router shared dependencies", () => {
        const config = defineDevHostConfig(SwcConfig, "host", 8080, {
            features: {
                router: "react-router"
            }
        });

        const result = findPlugin(config, matchConstructorName(webpack.container.ModuleFederationPlugin.name));

        expect(result).toMatchSnapshot();
    });

    test("when msw is activated, add msw shared dependency", () => {
        const config = defineDevHostConfig(SwcConfig, "host", 8080, {
            features: {
                msw: true
            }
        });

        const result = findPlugin(config, matchConstructorName(webpack.container.ModuleFederationPlugin.name));

        expect(result).toMatchSnapshot();
    });

    test("when i18next is activated, add i18next shared dependency and requiredVersion: false to the react shared dependency definition", () => {
        const config = defineDevHostConfig(SwcConfig, "host", 8080, {
            features: {
                i18next: true
            }
        });

        const result = findPlugin(config, matchConstructorName(webpack.container.ModuleFederationPlugin.name));

        expect(result).toMatchSnapshot();
    });

    test("when additional plugins are provided, the plugins are added to the configuration", () => {
        const config = defineDevHostConfig(SwcConfig, "host", 8080, {
            plugins: [new DummyPlugin({})]
        });

        const result = findPlugin(config, matchConstructorName(DummyPlugin.name));

        expect(result).toBeDefined();
    });

    test("when configuration transformers are provided, the transformers are applied to the configuration", () => {
        const result = defineDevHostConfig(SwcConfig, "host", 8080, {
            transformers: [(config: WebpackConfig) => {
                config.entry = "updated by the dummy transformer";

                return config;
            }]
        });

        expect(result.entry).toBe("updated by the dummy transformer");
    });

    test("when no options are provided for the html webpack plugin, add a public path option", () => {
        const config = defineDevHostConfig(SwcConfig, "host", 8080);

        const result = findPlugin(config, matchConstructorName(HtmlWebpackPlugin.name));

        // This is an option that is relative to the environment running the test and breaks on CI.
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        delete (result.plugin.userOptions as HtmlWebpackPlugin.Options)["template"];

        expect(result).toMatchSnapshot();
    });

    test("when options others than the public path option are provided for the html webpack plugin, add a public path option", () => {
        const config = defineDevHostConfig(SwcConfig, "host", 8080, {
            htmlWebpackPluginOptions: {
                favicon: "toto.png"
            }
        });

        const result = findPlugin(config, matchConstructorName(HtmlWebpackPlugin.name));

        expect(result).toMatchSnapshot();
    });

    test("when a public path option is provided for the html webpack plugin, do not alter the provided public path option", () => {
        const config = defineDevHostConfig(SwcConfig, "host", 8080, {
            htmlWebpackPluginOptions: {
                publicPath: "/toto"
            }
        });

        const result = findPlugin(config, matchConstructorName(HtmlWebpackPlugin.name));

        expect(result).toMatchSnapshot();
    });
});


describe("defineBuildHostConfig", () => {
    const SwcConfig = defineSwcBuildConfig({
        chrome: "116"
    });

    test("the application name is set as the federation plugin application name", () => {
        const config = defineBuildHostConfig(SwcConfig, "host");
        const result = findPlugin(config, matchConstructorName(webpack.container.ModuleFederationPlugin.name));

        expect(result).toMatchSnapshot();
    });

    test("when no public path is provided, the default public path is \"auto\"", () => {
        const config = defineBuildHostConfig(SwcConfig, "host");

        expect(config.output?.publicPath).toBe("auto");
    });

    test("when a public path is provided, use the provided public path", () => {
        const config = defineBuildHostConfig(SwcConfig, "host", {
            publicPath: "http://localhost:8080/"
        });

        expect(config.output?.publicPath).toBe("http://localhost:8080/");
    });

    test("the module federation plugin configuration includes the default shared dependencies", () => {
        const config = defineBuildHostConfig(SwcConfig, "host");
        const result = findPlugin(config, matchConstructorName(webpack.container.ModuleFederationPlugin.name));

        expect(result).toMatchSnapshot();
    });

    test("when additional shared dependencies are provided, add the dependencies to the module federation plugin configuration", () => {
        const config = defineBuildHostConfig(SwcConfig, "host", {
            sharedDependencies: {
                "first": {
                    singleton: true
                },
                "second": {
                    eager: true,
                    singleton: true
                }
            }
        });

        const result = findPlugin(config, matchConstructorName(webpack.container.ModuleFederationPlugin.name));

        expect(result).toMatchSnapshot();
    });

    test("when additional options are provided for an existing default shared dependency, add the consumer options to the default options", () => {
        const config = defineBuildHostConfig(SwcConfig, "host", {
            sharedDependencies: {
                "react": {
                    requiredVersion: "1.2.3"
                }
            }
        });

        const result = findPlugin(config, matchConstructorName(webpack.container.ModuleFederationPlugin.name));

        expect(result).toMatchSnapshot();
    });

    test("when overriding options are provided for a default shared dependency, use the consumer option", () => {
        const config = defineBuildHostConfig(SwcConfig, "host", {
            sharedDependencies: {
                "react": {
                    eager: false,
                    singleton: false
                }
            }
        });

        const result = findPlugin(config, matchConstructorName(webpack.container.ModuleFederationPlugin.name));

        expect(result).toMatchSnapshot();
    });

    test("when the router is react-router, add react-router shared dependencies", () => {
        const config = defineBuildHostConfig(SwcConfig, "host", {
            features: {
                router: "react-router"
            }
        });

        const result = findPlugin(config, matchConstructorName(webpack.container.ModuleFederationPlugin.name));

        expect(result).toMatchSnapshot();
    });

    test("when msw is activated, add msw shared dependency", () => {
        const config = defineBuildHostConfig(SwcConfig, "host", {
            features: {
                msw: true
            }
        });

        const result = findPlugin(config, matchConstructorName(webpack.container.ModuleFederationPlugin.name));

        expect(result).toMatchSnapshot();
    });

    test("when i18next is activated, add i18next shared dependency and requiredVersion: false to the react shared dependency definition", () => {
        const config = defineBuildHostConfig(SwcConfig, "host", {
            features: {
                i18next: true
            }
        });

        const result = findPlugin(config, matchConstructorName(webpack.container.ModuleFederationPlugin.name));

        expect(result).toMatchSnapshot();
    });

    test("when additional plugins are provided, the plugins are added to the configuration", () => {
        const config = defineBuildHostConfig(SwcConfig, "host", {
            plugins: [new DummyPlugin({})]
        });

        const result = findPlugin(config, matchConstructorName(DummyPlugin.name));

        expect(result).toBeDefined();
    });

    test("when configuration transformers are provided, the transformers are applied to the configuration", () => {
        const result = defineBuildHostConfig(SwcConfig, "host", {
            transformers: [(config: WebpackConfig) => {
                config.entry = "updated by the dummy transformer";

                return config;
            }]
        });

        expect(result.entry).toBe("updated by the dummy transformer");
    });

    test("when no options are provided for the html webpack plugin, add a public path option", () => {
        const config = defineBuildHostConfig(SwcConfig, "host");

        const result = findPlugin(config, matchConstructorName(HtmlWebpackPlugin.name));

        // This is an option that is relative to the environment running the test and breaks on CI.
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        delete (result.plugin.userOptions as HtmlWebpackPlugin.Options)["template"];

        expect(result).toMatchSnapshot();
    });

    test("when options others than the public path option are provided for the html webpack plugin, add a public path option", () => {
        const config = defineBuildHostConfig(SwcConfig, "host", {
            htmlWebpackPluginOptions: {
                favicon: "toto.png"
            }
        });

        const result = findPlugin(config, matchConstructorName(HtmlWebpackPlugin.name));

        expect(result).toMatchSnapshot();
    });

    test("when a public path option is provided for the html webpack plugin, do not alter the provided public path option", () => {
        const config = defineBuildHostConfig(SwcConfig, "host", {
            htmlWebpackPluginOptions: {
                publicPath: "/toto"
            }
        });

        const result = findPlugin(config, matchConstructorName(HtmlWebpackPlugin.name));

        expect(result).toMatchSnapshot();
    });
});


describe("defineDevRemoteModuleConfig", () => {
    const SwcConfig = defineSwcDevConfig({
        chrome: "116"
    });

    test("the application name is set as the federation plugin application name", () => {
        const config = defineDevRemoteModuleConfig(SwcConfig, "remote1", 8081);
        const result = findPlugin(config, matchConstructorName(webpack.container.ModuleFederationPlugin.name));

        expect(result).toMatchSnapshot();
    });

    test("the port number is set as the dev server port", () => {
        const result = defineDevRemoteModuleConfig(SwcConfig, "remote1", 8081);

        // "devServer" does exist but webpack types are a messed.
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        expect(result.devServer.port).toBe(8081);
    });

    test("when no public path is provided, the default public path is \"auto\"", () => {
        const config = defineDevRemoteModuleConfig(SwcConfig, "host", 8081);

        expect(config.output?.publicPath).toBe("auto");
    });

    test("when a public path is provided, use the provided public path", () => {
        const config = defineDevRemoteModuleConfig(SwcConfig, "host", 8081, {
            publicPath: "http://localhost:8081/"
        });

        expect(config.output?.publicPath).toBe("http://localhost:8081/");
    });

    test("fast refresh is disabled", () => {
        const config = defineDevRemoteModuleConfig(SwcConfig, "remote1", 8081);
        const result = findPlugin(config, matchConstructorName("ReactRefreshWebpackPlugin"));

        expect(result).toBeUndefined();
    });

    test("the module federation plugin configuration includes the default shared dependencies", () => {
        const config = defineDevRemoteModuleConfig(SwcConfig, "remote1", 8081);
        const result = findPlugin(config, matchConstructorName(webpack.container.ModuleFederationPlugin.name));

        expect(result).toMatchSnapshot();
    });

    test("when additional shared dependencies are provided, add the dependencies to the module federation plugin configuration", () => {
        const config = defineDevRemoteModuleConfig(SwcConfig, "remote1", 8081, {
            sharedDependencies: {
                "first": {
                    singleton: true
                },
                "second": {
                    eager: true,
                    singleton: true
                }
            }
        });

        const result = findPlugin(config, matchConstructorName(webpack.container.ModuleFederationPlugin.name));

        expect(result).toMatchSnapshot();
    });

    test("when additional options are provided for an existing default shared dependency, add the consumer options to the default options", () => {
        const config = defineDevRemoteModuleConfig(SwcConfig, "remote1", 8081, {
            sharedDependencies: {
                "react": {
                    requiredVersion: "1.2.3"
                }
            }
        });

        const result = findPlugin(config, matchConstructorName(webpack.container.ModuleFederationPlugin.name));

        expect(result).toMatchSnapshot();
    });

    test("when overriding options are provided for a default shared dependency, use the consumer option", () => {
        const config = defineDevRemoteModuleConfig(SwcConfig, "remote1", 8081, {
            sharedDependencies: {
                "react": {
                    eager: false,
                    singleton: false
                }
            }
        });

        const result = findPlugin(config, matchConstructorName(webpack.container.ModuleFederationPlugin.name));

        expect(result).toMatchSnapshot();
    });

    test("when the router is react-router, add react-router shared dependencies", () => {
        const config = defineDevRemoteModuleConfig(SwcConfig, "remote1", 8081, {
            features: {
                router: "react-router"
            }
        });

        const result = findPlugin(config, matchConstructorName(webpack.container.ModuleFederationPlugin.name));

        expect(result).toMatchSnapshot();
    });

    test("when msw is activated, add msw shared dependency", () => {
        const config = defineDevRemoteModuleConfig(SwcConfig, "remote1", 8081, {
            features: {
                msw: true
            }
        });

        const result = findPlugin(config, matchConstructorName(webpack.container.ModuleFederationPlugin.name));

        expect(result).toMatchSnapshot();
    });

    test("when i18next is activated, add i18next shared dependency and requiredVersion: false to the react shared dependency definition", () => {
        const config = defineDevRemoteModuleConfig(SwcConfig, "remote1", 8081, {
            features: {
                i18next: true
            }
        });

        const result = findPlugin(config, matchConstructorName(webpack.container.ModuleFederationPlugin.name));

        expect(result).toMatchSnapshot();
    });

    test("access control headers are added to the dev server configuration", () => {
        const result = defineDevRemoteModuleConfig(SwcConfig, "remote1", 8081);

        // "devServer" does exist but webpack types are a messed.
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        expect(result.devServer.headers["Access-Control-Allow-Origin"]).toBe("*");
    });

    test("when additional plugins are provided, the plugins are added to the configuration", () => {
        const config = defineDevRemoteModuleConfig(SwcConfig, "remote1", 8081, {
            plugins: [new DummyPlugin({})]
        });

        const result = findPlugin(config, matchConstructorName(DummyPlugin.name));

        expect(result).toBeDefined();
    });

    test("when additional configuration transformers are provided, the transformers are applied to the configuration", () => {
        const dummyTransformer = (config: WebpackConfig) => {
            config.entry = "updated by the dummy transformer";

            return config;
        };

        const result = defineDevRemoteModuleConfig(SwcConfig, "remote1", 8081, {
            transformers: [dummyTransformer]
        });

        expect(result.entry).toBe("updated by the dummy transformer");
    });
});

describe("defineBuildRemoteModuleConfig", () => {
    const SwcConfig = defineSwcBuildConfig({
        chrome: "116"
    });

    test("the application name is set as the federation plugin application name", () => {
        const config = defineBuildRemoteModuleConfig(SwcConfig, "remote1");
        const result = findPlugin(config, matchConstructorName(webpack.container.ModuleFederationPlugin.name));

        expect(result).toMatchSnapshot();
    });

    test("when no public path is provided, the default public path is \"auto\"", () => {
        const config = defineBuildRemoteModuleConfig(SwcConfig, "host");

        expect(config.output?.publicPath).toBe("auto");
    });

    test("when a public path is provided, use the provided public path", () => {
        const config = defineBuildRemoteModuleConfig(SwcConfig, "host", {
            publicPath: "http://localhost:8080/"
        });

        expect(config.output?.publicPath).toBe("http://localhost:8080/");
    });

    test("the module federation plugin configuration includes the default shared dependencies", () => {
        const config = defineBuildRemoteModuleConfig(SwcConfig, "remote1");
        const result = findPlugin(config, matchConstructorName(webpack.container.ModuleFederationPlugin.name));

        expect(result).toMatchSnapshot();
    });

    test("when additional shared dependencies are provided, add the dependencies to the module federation plugin configuration", () => {
        const config = defineBuildRemoteModuleConfig(SwcConfig, "remote1", {
            sharedDependencies: {
                "first": {
                    singleton: true
                },
                "second": {
                    eager: true,
                    singleton: true
                }
            }
        });

        const result = findPlugin(config, matchConstructorName(webpack.container.ModuleFederationPlugin.name));

        expect(result).toMatchSnapshot();
    });

    test("when additional options are provided for an existing default shared dependency, add the consumer options to the default options", () => {
        const config = defineBuildRemoteModuleConfig(SwcConfig, "remote1", {
            sharedDependencies: {
                "react": {
                    requiredVersion: "1.2.3"
                }
            }
        });

        const result = findPlugin(config, matchConstructorName(webpack.container.ModuleFederationPlugin.name));

        expect(result).toMatchSnapshot();
    });

    test("when overriding options are provided for a default shared dependency, use the consumer option", () => {
        const config = defineBuildRemoteModuleConfig(SwcConfig, "remote1", {
            sharedDependencies: {
                "react": {
                    eager: false,
                    singleton: false
                }
            }
        });

        const result = findPlugin(config, matchConstructorName(webpack.container.ModuleFederationPlugin.name));

        expect(result).toMatchSnapshot();
    });

    test("when the router is react-router, add react-router shared dependencies", () => {
        const config = defineBuildRemoteModuleConfig(SwcConfig, "remote1", {
            features: {
                router: "react-router"
            }
        });

        const result = findPlugin(config, matchConstructorName(webpack.container.ModuleFederationPlugin.name));

        expect(result).toMatchSnapshot();
    });

    test("when msw is activated, add msw shared dependency", () => {
        const config = defineBuildRemoteModuleConfig(SwcConfig, "remote1", {
            features: {
                msw: true
            }
        });

        const result = findPlugin(config, matchConstructorName(webpack.container.ModuleFederationPlugin.name));

        expect(result).toMatchSnapshot();
    });

    test("when i18next is activated, add i18next shared dependency and requiredVersion: false to the react shared dependency definition", () => {
        const config = defineBuildRemoteModuleConfig(SwcConfig, "remote1", {
            features: {
                i18next: true
            }
        });

        const result = findPlugin(config, matchConstructorName(webpack.container.ModuleFederationPlugin.name));

        expect(result).toMatchSnapshot();
    });

    test("when additional plugins are provided, the plugins are added to the configuration", () => {
        const config = defineBuildRemoteModuleConfig(SwcConfig, "remote1", {
            plugins: [new DummyPlugin({})]
        });

        const result = findPlugin(config, matchConstructorName(DummyPlugin.name));

        expect(result).toBeDefined();
    });

    test("when configuration transformers are provided, the transformers are applied to the configuration", () => {
        const dummyTransformer = (config: WebpackConfig) => {
            config.entry = "updated by the dummy transformer";

            return config;
        };

        const result = defineBuildRemoteModuleConfig(SwcConfig, "remote1", {
            transformers: [dummyTransformer]
        });

        expect(result.entry).toBe("updated by the dummy transformer");
    });
});

describe("defineHostModuleFederationPluginOptions", () => {
    test("merge the default options with the provided options", () => {
        const result = defineHostModuleFederationPluginOptions("host", {
            runtime: "a-custom-runtime-name"
        });

        expect(result.runtime).toBe("a-custom-runtime-name");
    });

    test("merge the shared dependencies with the default shared dependencies", () => {
        const result = defineHostModuleFederationPluginOptions("host", {
            shared: {
                "react": {
                    singleton: false,
                    requiredVersion: "1.2.3"
                },
                "first": {
                    singleton: true
                },
                "second": {
                    eager: true,
                    singleton: true
                }
            }
        });

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        expect(result.shared.react).toBeDefined();
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        expect(result.shared.react.singleton).toBeFalsy();
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        expect(result.shared.react.requiredVersion).toBe("1.2.3");
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        expect(result.shared.first).toBeDefined();
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        expect(result.shared.second).toBeDefined();
    });
});

describe("defineRemoteModuleFederationPluginOptions", () => {
    test("merge the default options with the provided options", () => {
        const result = defineRemoteModuleFederationPluginOptions("remote1", {
            runtime: "a-custom-runtime-name"
        });

        expect(result.runtime).toBe("a-custom-runtime-name");
    });

    test("merge the shared dependencies with the default shared dependencies", () => {
        const result = defineRemoteModuleFederationPluginOptions("remote1", {
            shared: {
                "react": {
                    singleton: false,
                    requiredVersion: "1.2.3"
                },
                "first": {
                    singleton: true
                },
                "second": {
                    eager: true,
                    singleton: true
                }
            }
        });

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        expect(result.shared.react).toBeDefined();
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        expect(result.shared.react.singleton).toBeFalsy();
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        expect(result.shared.react.requiredVersion).toBe("1.2.3");
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        expect(result.shared.first).toBeDefined();
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        expect(result.shared.second).toBeDefined();
    });

    test("can provide additional \"exposes\"", () => {
        const result = defineRemoteModuleFederationPluginOptions("remote1", {
            exposes: {
                "custom-file.js": "./src/custom-file.js"
            }
        });

        expect(Object.keys(result.exposes!).length).toBe(2);
        expect(Object.values(result.exposes!)[1]).toBe("./src/custom-file.js");
    });
});
