import type { KnipConfig } from "knip";

type KnipWorkspaceConfig = NonNullable<KnipConfig["workspaces"]>[string];

type KnipTransformer = (config: KnipWorkspaceConfig) => KnipWorkspaceConfig;

function defineWorkspace({ ignore, ...config }: KnipWorkspaceConfig, transformers?: KnipTransformer[]): KnipWorkspaceConfig {
    let transformedConfig: KnipWorkspaceConfig = {
        ...config,
        ignore: [
            ...(ignore as string[] ?? []),
            "node_modules/**",
            "dist/**"
        ]
    };

    if (transformers) {
        transformedConfig = transformers.reduce((acc, transformer) => transformer(acc), transformedConfig);
    }

    return transformedConfig;
}

const ignoreWebpackConfigsLoaders: KnipTransformer = ({ ignoreDependencies, ...config }) => {
    return {
        ...config,
        ignoreDependencies: [
            ...(ignoreDependencies as string[] ?? []),
            "css-loader",
            "postcss-loader",
            "swc-loader",
            "css-loader",
            "postcss-loader",
            "style-loader",
            "mini-css-extract-plugin",
            "@svgr/webpack"
        ]
    };
};

const ignoreBrowserslist: KnipTransformer = ({ ignoreDependencies, ...config }) => {
    return {
        ...config,
        ignoreDependencies: [
            ...(ignoreDependencies as string[] ?? []),
            // Browserlist isn't supported by plugins.
            "@workleap/browserslist-config"
        ]
    };
};

const configureMsw: KnipTransformer = ({ entry, ignore, ...config }) => {
    return {
        ...config,
        entry: [
            ...(entry as string[] ?? []),
            "src/mocks/browser.ts",
            "src/mocks/handlers.ts"
        ],
        ignore: [
            ...(ignore as string[] ?? []),
            // MSW isn't supported by plugins.
            "public/mockServiceWorker.js"
        ]
    };
};

// Unti Knip support workspace inheritance: https://github.com/webpro/knip/issues/516.
const configurePackage: KnipTransformer = config => {
    return {
        ...config,
        eslint: true,
        tsup: {
            config: ["tsup.*.ts"]
        }
    };
};

// Unti Knip support workspace inheritance: https://github.com/webpro/knip/issues/516.
const configureSampleHost: KnipTransformer = ({ entry, ignoreDependencies, ...config }) => {
    return {
        ...config,
        entry: [
            ...(entry as string[] ?? []),
            "src/index.ts"
        ],
        ignoreDependencies: [
            ...(ignoreDependencies as string[] ?? []),
            // Browserlist isn't supported by plugins.
            "@workleap/browserslist-config",
            // It's an optional dependency of @workleap/webpack-configs.
            "webpack-dev-server"
        ],
        eslint: true,
        webpack: {
            config: ["webpack.*.js"]
        }
    };
};

// Unti Knip support workspace inheritance: https://github.com/webpro/knip/issues/516.
const configureSampleLocalModule: KnipTransformer = ({ entry, ignoreDependencies, ...config }) => {
    return {
        ...config,
        entry: [
            ...(entry as string[] ?? []),
            "src/register.tsx",
            // Isolated environment.
            "src/dev/index.tsx"
        ],
        ignoreDependencies: [
            ...(ignoreDependencies as string[] ?? []),
            // It's an optional dependency of @workleap/webpack-configs.
            "webpack-dev-server"
        ],
        eslint: true,
        tsup: {
            config: ["tsup.*.ts"]
        },
        webpack: {
            config: ["webpack.config.js", "webpack.*.js"]
        }
    };
};

// Unti Knip support workspace inheritance: https://github.com/webpro/knip/issues/516.
const configureSampleRemoteModule: KnipTransformer = ({ entry, ignoreDependencies, ...config }) => {
    return {
        ...config,
        entry: [
            ...(entry as string[] ?? []),
            "src/register.tsx",
            // Isolated environment.
            "src/dev/index.tsx"
        ],
        ignoreDependencies: [
            ...(ignoreDependencies as string[] ?? []),
            // It's an optional dependency of @workleap/webpack-configs.
            "webpack-dev-server"
        ],
        eslint: true,
        webpack: {
            config: ["webpack.*.js"]
        }
    };
};

// Unti Knip support workspace inheritance: https://github.com/webpro/knip/issues/516.
const configureSampleLibrary: KnipTransformer = ({ entry, ...config }) => {
    return {
        ...config,
        entry: [
            ...(entry as string[] ?? []),
            "src/index.ts"
        ],
        eslint: true,
        tsup: {
            config: ["tsup.*.ts"]
        }
    };
};

export function defineConfig() {
    const rootConfig: KnipWorkspaceConfig = defineWorkspace({
        ignoreBinaries: [
            // This binaries is called "build-endpoints-isolated" for the samples.
            "build-isolated"
        ],
        ignoreDependencies: [
            // Azure Devops pipeline aren't supported by plugins.
            "netlify-cli",
            // Installed once for all the workspace's projects
            "ts-node"
        ]
    });

    const packagesConfig: KnipWorkspaceConfig = defineWorkspace({}, [
        configurePackage
    ]);

    const mswConfig: KnipWorkspaceConfig = defineWorkspace({
        ignoreDependencies: [
            "msw"
        ]
    }, [
        configurePackage
    ]);

    const sampleModuleHost: KnipWorkspaceConfig = defineWorkspace({}, [
        configureSampleHost,
        ignoreWebpackConfigsLoaders,
        ignoreBrowserslist,
        configureMsw
    ]);

    const sampleLocalModuleConfig: KnipWorkspaceConfig = defineWorkspace({}, [
        configureSampleLocalModule,
        ignoreWebpackConfigsLoaders,
        ignoreBrowserslist,
        configureMsw
    ]);

    const sampleRemoteModuleConfig: KnipWorkspaceConfig = defineWorkspace({}, [
        configureSampleRemoteModule,
        ignoreWebpackConfigsLoaders,
        ignoreBrowserslist,
        configureMsw
    ]);

    const sampleLibraryConfig: KnipWorkspaceConfig = defineWorkspace({}, [
        configureSampleLibrary,
        configureMsw
    ]);

    const config: KnipConfig = {
        workspaces: {
            ".": rootConfig,
            "packages/*": packagesConfig,
            "packages/msw": mswConfig,
            "samples/basic/host": sampleModuleHost,
            "samples/basic/local-module": sampleLocalModuleConfig,
            "samples/basic/another-remote-module": sampleRemoteModuleConfig,
            "samples/basic/remote-module": sampleRemoteModuleConfig,
            "samples/basic/shared": sampleLibraryConfig,
            "samples/basic/shell": sampleLibraryConfig,
            "samples/endpoints/host": sampleModuleHost,
            "samples/endpoints/local-module": sampleLocalModuleConfig,
            "samples/endpoints/remote-module": sampleRemoteModuleConfig,
            "samples/endpoints/shared": sampleLibraryConfig,
            "samples/endpoints/shell": sampleLibraryConfig,
            "samples/endpoints/i18next": sampleLibraryConfig,
            "samples/endpoints/layouts": sampleLibraryConfig
        },
        exclude: [
            // It cause issues with config like Jest "projects".
            "unresolved"
        ],
        ignoreExportsUsedInFile: true
    };

    return config;
}

export default defineConfig();
