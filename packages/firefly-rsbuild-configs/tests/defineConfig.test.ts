import { pluginModuleFederation } from "@module-federation/rsbuild-plugin";
import type { RsbuildConfig, RsbuildPlugin, RsbuildPlugins } from "@rsbuild/core";
import { __clearModuleFederationPluginFactory, __setModuleFederationPluginFactory, defineBuildHostConfig, defineDevHostConfig, type ModuleFederationPluginOptions } from "../src/defineConfig.ts";

const dummyPlugin = (): RsbuildPlugin => {
    return {
        name: "dummy-plugin",
        setup: () => {
            console.log("Setup Dummy plugin.");
        }
    };
};

const pluginModuleFederationWrapper = (moduleFederationOptions: ModuleFederationPluginOptions): RsbuildPlugin => {
    const originalPlugin = pluginModuleFederation(moduleFederationOptions);

    return {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        _options: moduleFederationOptions,
        ...originalPlugin
    };
};

function findPlugin(name: string, plugins: RsbuildPlugins = []) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const plugin = plugins.find(x => x!.name === name);

    if (!plugin) {
        throw new Error(`Cannot find Rspack plugin named: "${name}".`);
    }

    return plugin as RsbuildPlugin;
}

// The following options are relative to the environment running the test and breaks on CI.
function prepareModuleFederationPluginForSnapshot(plugin: RsbuildPlugin) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const options = plugin._options;

    delete (options as ModuleFederationPluginOptions)["runtimePlugins"];

    return options;
}

describe("defineDevHostConfig", () => {
    beforeAll(() => {
        __setModuleFederationPluginFactory(pluginModuleFederationWrapper);
    });

    afterAll(() => {
        __clearModuleFederationPluginFactory();
    });

    test("the application name is set as the federation plugin application name", () => {
        const config = defineDevHostConfig(8080, []);
        const plugin = findPlugin("rsbuild:module-federation-enhanced", config.plugins);

        expect(plugin).toBeDefined();
        expect(prepareModuleFederationPluginForSnapshot(plugin)).toMatchSnapshot();
    });

    test("the port number is set as the dev server port and the public path port", () => {
        const result = defineDevHostConfig(8080, []);

        expect(result.server?.port).toBe(8080);
    });

    test("when no asset prefix is provided, the default asset prefix is \"auto\"", () => {
        const config = defineDevHostConfig(8080, []);

        expect(config.dev?.assetPrefix).toBe("auto");
    });

    test("when an asset prefix is provided, use the provided asset prefix", () => {
        const config = defineDevHostConfig(8080, [], {
            assetPrefix: "http://localhost:8080/"
        });

        expect(config.dev?.assetPrefix).toBe("http://localhost:8080/");
    });

    test("when no value is provided for lazy compilation, lazy compilation is disabled", () => {
        const config = defineDevHostConfig(8080, []);

        expect(config.dev?.lazyCompilation).toBeFalsy();
    });

    test("when a value is provided for lazy compilation, use the provided value", () => {
        const config = defineDevHostConfig(8080, [], {
            lazyCompilation: true
        });

        expect(config.dev?.lazyCompilation).toBeTruthy();
    });

    test("when a function is provided to override the module federation plugin, apply the function", () => {
        const config = defineDevHostConfig(8080, [], {
            moduleFederationPluginOptions: (defaultOptions: ModuleFederationPluginOptions) => {
                defaultOptions.filename = "this is a dummy test value";

                return defaultOptions;
            }
        });

        const plugin = findPlugin("rsbuild:module-federation-enhanced", config.plugins);

        expect(plugin).toBeDefined();
        expect(prepareModuleFederationPluginForSnapshot(plugin)).toMatchSnapshot();
    });

    test("the module federation plugin configuration includes the remotes", () => {
        const config = defineDevHostConfig(8080, [
            { name: "remote1", url: "http://localhost/remote1" },
            { name: "remote2", url: "http://localhost/remote2" }
        ]);

        const plugin = findPlugin("rsbuild:module-federation-enhanced", config.plugins);

        expect(plugin).toBeDefined();
        expect(prepareModuleFederationPluginForSnapshot(plugin)).toMatchSnapshot();
    });

    test("the module federation plugin configuration includes the default shared dependencies", () => {
        const config = defineDevHostConfig(8080, []);
        const plugin = findPlugin("rsbuild:module-federation-enhanced", config.plugins);

        expect(plugin).toBeDefined();
        expect(prepareModuleFederationPluginForSnapshot(plugin)).toMatchSnapshot();
    });

    test("when additional shared dependencies are provided, add the dependencies to the module federation plugin configuration", () => {
        const config = defineDevHostConfig(8080, [], {
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

        const plugin = findPlugin("rsbuild:module-federation-enhanced", config.plugins);

        expect(plugin).toBeDefined();
        expect(prepareModuleFederationPluginForSnapshot(plugin)).toMatchSnapshot();
    });

    test("when additional options are provided for an existing default shared dependency, add the consumer options to the default options", () => {
        const config = defineDevHostConfig(8080, [], {
            sharedDependencies: {
                "react": {
                    requiredVersion: "1.2.3"
                }
            }
        });

        const plugin = findPlugin("rsbuild:module-federation-enhanced", config.plugins);

        expect(plugin).toBeDefined();
        expect(prepareModuleFederationPluginForSnapshot(plugin)).toMatchSnapshot();
    });

    test("when overriding options are provided for a default shared dependency, use the consumer option", () => {
        const config = defineDevHostConfig(8080, [], {
            sharedDependencies: {
                "react": {
                    eager: false,
                    singleton: false
                }
            }
        });

        const plugin = findPlugin("rsbuild:module-federation-enhanced", config.plugins);

        expect(plugin).toBeDefined();
        expect(prepareModuleFederationPluginForSnapshot(plugin)).toMatchSnapshot();
    });

    test("when the router is not react-router, do not add react-router shared dependencies", () => {
        const config = defineDevHostConfig(8080, [], {
            features: {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                router: "something-else"
            }
        });

        const plugin = findPlugin("rsbuild:module-federation-enhanced", config.plugins);

        expect(plugin).toBeDefined();
        expect(prepareModuleFederationPluginForSnapshot(plugin)).toMatchSnapshot();
    });

    test("when i18next is activated, add i18next shared dependency and requiredVersion: false to the react shared dependency definition", () => {
        const config = defineDevHostConfig(8080, [], {
            features: {
                i18next: true
            }
        });

        const plugin = findPlugin("rsbuild:module-federation-enhanced", config.plugins);

        expect(plugin).toBeDefined();
        expect(prepareModuleFederationPluginForSnapshot(plugin)).toMatchSnapshot();
    });

    test("when honeycomb is activated, add honeycomb shared dependency and requiredVersion: false to the react shared dependency definition", () => {
        const config = defineDevHostConfig(8080, [], {
            features: {
                honeycomb: true
            }
        });

        const plugin = findPlugin("rsbuild:module-federation-enhanced", config.plugins);

        expect(plugin).toBeDefined();
        expect(prepareModuleFederationPluginForSnapshot(plugin)).toMatchSnapshot();
    });

    test("when environmentVariables is activated, add env-var shared dependency and requiredVersion: false to the react shared dependency definition", () => {
        const config = defineDevHostConfig(8080, [], {
            features: {
                environmentVariables: true
            }
        });

        const plugin = findPlugin("rsbuild:module-federation-enhanced", config.plugins);

        expect(plugin).toBeDefined();
        expect(prepareModuleFederationPluginForSnapshot(plugin)).toMatchSnapshot();
    });

    test("when additional plugins are provided, the plugins are added to the configuration", () => {
        const config = defineDevHostConfig(8080, [], {
            plugins: [dummyPlugin()]
        });

        const plugin = findPlugin("dummy-plugin", config.plugins);

        expect(plugin).toBeDefined();
    });

    test("when configuration transformers are provided, the transformers are applied to the configuration", () => {
        const result = defineDevHostConfig(8080, [], {
            transformers: [(config: RsbuildConfig) => {
                config.source = config.source ?? {};

                config.source.entry = {
                    index: "updated by the dummy transformer"
                };

                return config;
            }]
        });

        expect(result.source!.entry!.index).toBe("updated by the dummy transformer");
    });
});

describe("defineBuildHostConfig", () => {
    beforeAll(() => {
        __setModuleFederationPluginFactory(pluginModuleFederationWrapper);
    });

    afterAll(() => {
        __clearModuleFederationPluginFactory();
    });

    test("the application name is set as the federation plugin application name", () => {
        const config = defineBuildHostConfig([]);
        const plugin = findPlugin("rsbuild:module-federation-enhanced", config.plugins);

        expect(plugin).toBeDefined();
        expect(prepareModuleFederationPluginForSnapshot(plugin)).toMatchSnapshot();
    });

    test("when no asset prefix is provided, the default asset prefix is \"auto\"", () => {
        const config = defineBuildHostConfig([]);
        const plugin = findPlugin("rsbuild:module-federation-enhanced", config.plugins);

        expect(plugin).toBeDefined();
        expect(prepareModuleFederationPluginForSnapshot(plugin)).toMatchSnapshot();
    });

    test("when an asset prefix is provided, use the provided asset prefix", () => {
        const config = defineBuildHostConfig([], {
            assetPrefix: "http://localhost:8080/"
        });

        expect(config.output?.assetPrefix).toBe("http://localhost:8080/");
    });

    test("when a function is provided to override the module federation plugin, apply the function", () => {
        const config = defineBuildHostConfig([], {
            moduleFederationPluginOptions: (defaultOptions: ModuleFederationPluginOptions) => {
                defaultOptions.filename = "this is a dummy test value";

                return defaultOptions;
            }
        });

        const plugin = findPlugin("rsbuild:module-federation-enhanced", config.plugins);

        expect(plugin).toBeDefined();
        expect(prepareModuleFederationPluginForSnapshot(plugin)).toMatchSnapshot();
    });

    test("the module federation plugin configuration includes the remotes", () => {
        const config = defineBuildHostConfig([
            { name: "remote1", url: "http://localhost/remote1" },
            { name: "remote2", url: "http://localhost/remote2" }
        ]);

        const plugin = findPlugin("rsbuild:module-federation-enhanced", config.plugins);

        expect(plugin).toBeDefined();
        expect(prepareModuleFederationPluginForSnapshot(plugin)).toMatchSnapshot();
    });

    test("the module federation plugin configuration includes the default shared dependencies", () => {
        const config = defineBuildHostConfig([]);
        const plugin = findPlugin("rsbuild:module-federation-enhanced", config.plugins);

        expect(plugin).toBeDefined();
        expect(prepareModuleFederationPluginForSnapshot(plugin)).toMatchSnapshot();
    });

    test("when additional shared dependencies are provided, add the dependencies to the module federation plugin configuration", () => {
        const config = defineBuildHostConfig([], {
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

        const plugin = findPlugin("rsbuild:module-federation-enhanced", config.plugins);

        expect(plugin).toBeDefined();
        expect(prepareModuleFederationPluginForSnapshot(plugin)).toMatchSnapshot();
    });

    test("when additional options are provided for an existing default shared dependency, add the consumer options to the default options", () => {
        const config = defineBuildHostConfig([], {
            sharedDependencies: {
                "react": {
                    requiredVersion: "1.2.3"
                }
            }
        });

        const plugin = findPlugin("rsbuild:module-federation-enhanced", config.plugins);

        expect(plugin).toBeDefined();
        expect(prepareModuleFederationPluginForSnapshot(plugin)).toMatchSnapshot();
    });

    test("when overriding options are provided for a default shared dependency, use the consumer option", () => {
        const config = defineBuildHostConfig([], {
            sharedDependencies: {
                "react": {
                    eager: false,
                    singleton: false
                }
            }
        });

        const plugin = findPlugin("rsbuild:module-federation-enhanced", config.plugins);

        expect(plugin).toBeDefined();
        expect(prepareModuleFederationPluginForSnapshot(plugin)).toMatchSnapshot();
    });

    test("when the router is not react-router, do not add react-router shared dependencies", () => {
        const config = defineBuildHostConfig([], {
            features: {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                router: "something-else"
            }
        });

        const plugin = findPlugin("rsbuild:module-federation-enhanced", config.plugins);

        expect(plugin).toBeDefined();
        expect(prepareModuleFederationPluginForSnapshot(plugin)).toMatchSnapshot();
    });

    test("when i18next is activated, add i18next shared dependency and requiredVersion: false to the react shared dependency definition", () => {
        const config = defineBuildHostConfig([], {
            features: {
                i18next: true
            }
        });

        const plugin = findPlugin("rsbuild:module-federation-enhanced", config.plugins);

        expect(plugin).toBeDefined();
        expect(prepareModuleFederationPluginForSnapshot(plugin)).toMatchSnapshot();
    });

    test("when honeycomb is activated, add honeycomb shared dependency and requiredVersion: false to the react shared dependency definition", () => {
        const config = defineBuildHostConfig([], {
            features: {
                honeycomb: true
            }
        });

        const plugin = findPlugin("rsbuild:module-federation-enhanced", config.plugins);

        expect(plugin).toBeDefined();
        expect(prepareModuleFederationPluginForSnapshot(plugin)).toMatchSnapshot();
    });

    test("when environmentVariables is env-vars, add env-vars shared dependency and requiredVersion: false to the react shared dependency definition", () => {
        const config = defineBuildHostConfig([], {
            features: {
                environmentVariables: true
            }
        });

        const plugin = findPlugin("rsbuild:module-federation-enhanced", config.plugins);

        expect(plugin).toBeDefined();
        expect(prepareModuleFederationPluginForSnapshot(plugin)).toMatchSnapshot();
    });

    test("when additional plugins are provided, the plugins are added to the configuration", () => {
        const config = defineBuildHostConfig([], {
            plugins: [dummyPlugin()]
        });

        const plugin = findPlugin("dummy-plugin", config.plugins);

        expect(plugin).toBeDefined();
    });

    test("when configuration transformers are provided, the transformers are applied to the configuration", () => {
        const result = defineBuildHostConfig([], {
            transformers: [(config: RsbuildConfig) => {
                config.source = config.source ?? {};

                config.source.entry = {
                    index: "updated by the dummy transformer"
                };

                return config;
            }]
        });

        expect(result.source!.entry!.index).toBe("updated by the dummy transformer");
    });
});
