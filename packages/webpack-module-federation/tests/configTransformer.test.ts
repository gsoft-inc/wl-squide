import { hostTransformer, remoteTransformer } from "../src/configTransformer.ts";

import webpack from "webpack";

/*
TODO: Add snapshot tests with at least those use cases:
    - pluginOptions already contains a "shared" section
    - pluginOptions doesn't contains a "shared" section
    - with additional shared dependencies
    - with reactOptions (and all the other similar options)
    - with additional "exposes" for a remote
    - with a different filename for a remote

    - with pluginOptions that are not "shared" values
*/

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
    test("default configuration", () => {
        expect(hostTransformer({}, "host")).toMatchSnapshot();
    });

    test("merge with existing config values", () => {
        const userConfig: webpack.Configuration = {
            mode: "development",
            target: "web",
            devtool: "eval-cheap-module-source-map"
        };

        expect(hostTransformer(userConfig, "host")).toMatchSnapshot();
    });

    test("when the plugins array already exist, append to the existing plugins array", () => {
        const userConfig: webpack.Configuration = {
            plugins: [new DummyPlugin({})]
        };

        expect(hostTransformer(userConfig, "host")).toMatchSnapshot();
    });

    test("when a ModuleFederationPlugin instance has already been added to the plugins, throw an error", () => {
        const userConfig: webpack.Configuration = {
            plugins: [
                new webpack.container.ModuleFederationPlugin({})
            ]
        };

        expect(() => hostTransformer(userConfig, "host")).toThrow(/ModuleFederationPlugin/);
    });
});

describe("remote", () => {
    test("default configuration", () => {
        expect(remoteTransformer({}, "remote")).toMatchSnapshot();
    });
});


