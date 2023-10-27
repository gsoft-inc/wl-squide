import { defineBuildConfig as defineSwcBuildConfig, defineDevConfig as defineSwcDevConfig } from "@workleap/swc-configs";
import { findPlugin, matchConstructorName, type WebpackConfig } from "@workleap/webpack-configs";
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
        expect(result.output?.publicPath).toMatch(/8080/i);
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

    test("when the router is not react-router, do not add react-router shared dependencies", () => {
        const config = defineDevHostConfig(SwcConfig, "host", 8080, {
            features: {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                router: "another-router"
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
});


describe("defineBuildHostConfig", () => {
    const SwcConfig = defineSwcBuildConfig({
        chrome: "116"
    });

    test("the application name is set as the federation plugin application name", () => {
        const config = defineBuildHostConfig(SwcConfig, "host", "http://localhost:8080/");
        const result = findPlugin(config, matchConstructorName(webpack.container.ModuleFederationPlugin.name));

        expect(result).toMatchSnapshot();
    });

    test("the public path is forwarded", () => {
        const result = defineBuildHostConfig(SwcConfig, "host", "http://localhost:8080/");

        expect(result.output?.publicPath).toBe("http://localhost:8080/");
    });

    test("the module federation plugin configuration includes the default shared dependencies", () => {
        const config = defineBuildHostConfig(SwcConfig, "host", "http://localhost:8080/");
        const result = findPlugin(config, matchConstructorName(webpack.container.ModuleFederationPlugin.name));

        expect(result).toMatchSnapshot();
    });

    test("when additional shared dependencies are provided, add the dependencies to the module federation plugin configuration", () => {
        const config = defineBuildHostConfig(SwcConfig, "host", "http://localhost:8080/", {
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
        const config = defineBuildHostConfig(SwcConfig, "host", "http://localhost:8080/", {
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
        const config = defineBuildHostConfig(SwcConfig, "host", "http://localhost:8080/", {
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

    test("when the router is not react-router, do not add react-router shared dependencies", () => {
        const config = defineBuildHostConfig(SwcConfig, "host", "http://localhost:8080/", {
            features: {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                router: "another-router"
            }
        });

        const result = findPlugin(config, matchConstructorName(webpack.container.ModuleFederationPlugin.name));

        expect(result).toMatchSnapshot();
    });

    test("when msw is activated, add msw shared dependency", () => {
        const config = defineBuildHostConfig(SwcConfig, "host", "http://localhost:8080/", {
            features: {
                msw: true
            }
        });

        const result = findPlugin(config, matchConstructorName(webpack.container.ModuleFederationPlugin.name));

        expect(result).toMatchSnapshot();
    });

    test("when additional plugins are provided, the plugins are added to the configuration", () => {
        const config = defineBuildHostConfig(SwcConfig, "host", "http://localhost:8080/", {
            plugins: [new DummyPlugin({})]
        });

        const result = findPlugin(config, matchConstructorName(DummyPlugin.name));

        expect(result).toBeDefined();
    });

    test("when configuration transformers are provided, the transformers are applied to the configuration", () => {
        const result = defineBuildHostConfig(SwcConfig, "host", "http://localhost:8080/", {
            transformers: [(config: WebpackConfig) => {
                config.entry = "updated by the dummy transformer";

                return config;
            }]
        });

        expect(result.entry).toBe("updated by the dummy transformer");
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

    test("the port number is set as the dev server port and the public path port", () => {
        const result = defineDevRemoteModuleConfig(SwcConfig, "remote1", 8081);

        // "devServer" does exist but webpack types are a messed.
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        expect(result.devServer.port).toBe(8081);
        expect(result.output?.publicPath).toMatch(/8081/i);
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

    test("when the router is not react-router, do not add react-router shared dependencies", () => {
        const config = defineDevRemoteModuleConfig(SwcConfig, "remote1", 8081, {
            features: {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                router: "another-router"
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
        const config = defineBuildRemoteModuleConfig(SwcConfig, "remote1", "http://localhost:8081/");
        const result = findPlugin(config, matchConstructorName(webpack.container.ModuleFederationPlugin.name));

        expect(result).toMatchSnapshot();
    });

    test("the public path is forwarded", () => {
        const result = defineBuildRemoteModuleConfig(SwcConfig, "remote1", "http://localhost:8081/");

        expect(result.output?.publicPath).toBe("http://localhost:8081/");
    });

    test("the module federation plugin configuration includes the default shared dependencies", () => {
        const config = defineBuildRemoteModuleConfig(SwcConfig, "remote1", "http://localhost:8081/");
        const result = findPlugin(config, matchConstructorName(webpack.container.ModuleFederationPlugin.name));

        expect(result).toMatchSnapshot();
    });

    test("when additional shared dependencies are provided, add the dependencies to the module federation plugin configuration", () => {
        const config = defineBuildRemoteModuleConfig(SwcConfig, "remote1", "http://localhost:8081/", {
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
        const config = defineBuildRemoteModuleConfig(SwcConfig, "remote1", "http://localhost:8081/", {
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
        const config = defineBuildRemoteModuleConfig(SwcConfig, "remote1", "http://localhost:8081/", {
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

    test("when the router is not react-router, do not add react-router shared dependencies", () => {
        const config = defineBuildRemoteModuleConfig(SwcConfig, "remote1", "http://localhost:8081/", {
            features: {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                router: "another-router"
            }
        });

        const result = findPlugin(config, matchConstructorName(webpack.container.ModuleFederationPlugin.name));

        expect(result).toMatchSnapshot();
    });

    test("when msw is activated, add msw shared dependency", () => {
        const config = defineBuildRemoteModuleConfig(SwcConfig, "remote1", "http://localhost:8081/", {
            features: {
                msw: true
            }
        });

        const result = findPlugin(config, matchConstructorName(webpack.container.ModuleFederationPlugin.name));

        expect(result).toMatchSnapshot();
    });

    test("when additional plugins are provided, the plugins are added to the configuration", () => {
        const config = defineBuildRemoteModuleConfig(SwcConfig, "remote1", "http://localhost:8081/", {
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

        const result = defineBuildRemoteModuleConfig(SwcConfig, "remote1", "http://localhost:8081/", {
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
