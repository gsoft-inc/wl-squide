/*
dev remote:
    - when additional configuration transformers are provided, the transformers are added to the configuration
*/

// import { defineBuildConfig as defineSwcBuildConfig, defineDevConfig as defineSwcDevConfig } from "@workleap/swc-configs";
import { defineDevConfig as defineSwcDevConfig } from "@workleap/swc-configs";
import { findPlugin, matchConstructorName, type WebpackConfig } from "@workleap/webpack-configs";
import webpack from "webpack";
import { defineDevHostConfig, defineDevRemoteModuleConfig } from "../src/defineConfig.ts";

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
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            router: "another-router"
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
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            router: "another-router"
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
