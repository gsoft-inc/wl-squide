import { hostTransformer, remoteTransformer, type ModuleFederationOptions } from "../src/configTransformer.ts";

import webpack from "webpack";

class DummyPlugin {
    _options: unknown;

    constructor(options: unknown) {
        this._options = options;
    }

    apply() {
        console.log("Apply Dummy plugin.");
    }
}

describe("host", () => {
    test("default transformation includes shared dependencies", () => {
        expect(hostTransformer({}, "host")).toMatchSnapshot();
    });

    test("when the plugins array already exist, append ModuleFederationPlugin to the existing plugins array", () => {
        const userConfig: webpack.Configuration = {
            plugins: [new DummyPlugin({})]
        };

        expect(hostTransformer(userConfig, "host")).toMatchSnapshot();
    });

    test("when a ModuleFederationPlugin instance has already been added to the plugins array, throw an error", () => {
        const userConfig: webpack.Configuration = {
            plugins: [
                new webpack.container.ModuleFederationPlugin({})
            ]
        };

        expect(() => hostTransformer(userConfig, "host")).toThrow(/ModuleFederationPlugin/);
    });

    test("when the consumer config already contains fields, do not alter those fields", () => {
        const userConfig: webpack.Configuration = {
            mode: "development",
            target: "web",
            devtool: "eval-cheap-module-source-map"
        };

        expect(hostTransformer(userConfig, "host")).toMatchSnapshot();
    });

    test("when pluginOptions contains additional shared dependencies, merge them with the default shared dependencies", () => {
        const transformerOptions: ModuleFederationOptions = {
            pluginOptions: {
                shared: {
                    "useless-lib": {
                        singleton: true
                    }
                }
            }
        };

        expect(hostTransformer({}, "host", transformerOptions)).toMatchSnapshot();
    });

    test("when pluginOptions contains additional options for a default shared dependencies, merge consumer options with the default options", () => {
        const transformerOptions: ModuleFederationOptions = {
            pluginOptions: {
                shared: {
                    "react": {
                        requiredVersion: "1.2.3"
                    }
                }
            }
        };

        expect(hostTransformer({}, "host", transformerOptions)).toMatchSnapshot();
    });

    test("when pluginOptions contains options overriding the default options of a default shared dependencies, use the consumer options", () => {
        const transformerOptions: ModuleFederationOptions = {
            pluginOptions: {
                shared: {
                    "react": {
                        singleton: false
                    }
                }
            }
        };

        expect(hostTransformer({}, "host", transformerOptions)).toMatchSnapshot();
    });

    test("when the router is not react-router, do not add react-router shared dependencies", () => {
        const transformerOptions: ModuleFederationOptions = {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            router: "tanstack-router"
        };

        expect(hostTransformer({}, "host", transformerOptions)).toMatchSnapshot();
    });
});

describe("remote", () => {
    test("default transformation includes shared dependencies", () => {
        expect(remoteTransformer({}, "remote")).toMatchSnapshot();
    });

    test("when the plugins array already exist, append ModuleFederationPlugin to the existing plugins array", () => {
        const userConfig: webpack.Configuration = {
            plugins: [new DummyPlugin({})]
        };

        expect(remoteTransformer(userConfig, "remote")).toMatchSnapshot();
    });

    test("when a ModuleFederationPlugin instance has already been added to the plugins array, throw an error", () => {
        const userConfig: webpack.Configuration = {
            plugins: [
                new webpack.container.ModuleFederationPlugin({})
            ]
        };

        expect(() => remoteTransformer(userConfig, "remote")).toThrow(/ModuleFederationPlugin/);
    });

    test("when the consumer config already contains fields, do not alter those fields", () => {
        const userConfig: webpack.Configuration = {
            mode: "development",
            target: "web",
            devtool: "eval-cheap-module-source-map"
        };

        expect(remoteTransformer(userConfig, "remote")).toMatchSnapshot();
    });

    test("when pluginOptions contains additional shared dependencies, merge them with the default shared dependencies", () => {
        const transformerOptions: ModuleFederationOptions = {
            pluginOptions: {
                shared: {
                    "useless-lib": {
                        singleton: true
                    }
                }
            }
        };

        expect(remoteTransformer({}, "remote", transformerOptions)).toMatchSnapshot();
    });

    test("when pluginOptions contains additional options for a default shared dependencies, merge consumer options with the default options", () => {
        const transformerOptions: ModuleFederationOptions = {
            pluginOptions: {
                shared: {
                    "react": {
                        requiredVersion: "1.2.3"
                    }
                }
            }
        };

        expect(remoteTransformer({}, "remote", transformerOptions)).toMatchSnapshot();
    });

    test("when pluginOptions contains options overriding the default options of a default shared dependencies, use the consumer options", () => {
        const transformerOptions: ModuleFederationOptions = {
            pluginOptions: {
                shared: {
                    "react": {
                        singleton: false
                    }
                }
            }
        };

        expect(remoteTransformer({}, "remote", transformerOptions)).toMatchSnapshot();
    });

    test("when pluginOptions contains additional remotes to expose, merge consumer options with the default options", () => {
        const transformerOptions: ModuleFederationOptions = {
            pluginOptions: {
                exposes: {
                    "./toto": "./src/toto"
                }
            }
        };

        expect(remoteTransformer({}, "remote", transformerOptions)).toMatchSnapshot();
    });

    test("when pluginOptions contains a filename, use the consumer filename instead of the default one", () => {
        const transformerOptions: ModuleFederationOptions = {
            pluginOptions: {
                filename: "toto"
            }
        };

        expect(remoteTransformer({}, "remote", transformerOptions)).toMatchSnapshot();
    });

    test("when the router is not react-router, do not add react-router shared dependencies", () => {
        const transformerOptions: ModuleFederationOptions = {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            router: "tanstack-router"
        };

        expect(remoteTransformer({}, "remote", transformerOptions)).toMatchSnapshot();
    });
});


